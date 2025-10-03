import { db } from '@/lib/db'

export interface Job {
  id: string
  type: string
  payload: string // JSON string
  parsedPayload?: any // Parsed payload for convenience
  status: 'pending' | 'processing' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  attempts: number
  maxAttempts: number
  scheduledAt: Date
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
  result?: string // JSON string
  parsedResult?: any // Parsed result for convenience
  createdAt: Date
  updatedAt: Date
}

export interface JobHandler {
  type: string
  handler: (job: Job) => Promise<any>
  maxAttempts?: number
  retryDelay?: number // in milliseconds
}

class BackgroundJobQueue {
  private handlers: Map<string, JobHandler> = new Map()
  private isProcessing: boolean = false
  private concurrency: number = 5
  private pollInterval: number = 5000 // 5 seconds

  constructor() {
    this.start()
  }

  // Register a job handler
  registerHandler(handler: JobHandler): void {
    this.handlers.set(handler.type, handler)
  }

  // Add a new job to the queue
  async addJob(
    type: string,
    payload: any,
    options: {
      priority?: 'low' | 'medium' | 'high' | 'critical'
      scheduledAt?: Date
      maxAttempts?: number
    } = {}
  ): Promise<string> {
    const {
      priority = 'medium',
      scheduledAt = new Date(),
      maxAttempts = 3
    } = options

    // Validate that handler exists
    if (!this.handlers.has(type)) {
      throw new Error(`No handler registered for job type: ${type}`)
    }

    const job = await db.backgroundJob.create({
      data: {
        type,
        payload: JSON.stringify(payload),
        status: 'pending',
        priority,
        attempts: 0,
        maxAttempts,
        scheduledAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return job.id
  }

  // Start processing jobs
  private start(): void {
    if (this.isProcessing) return

    this.isProcessing = true
    this.process()
  }

  // Stop processing jobs
  stop(): void {
    this.isProcessing = false
  }

  // Main processing loop
  private async process(): Promise<void> {
    while (this.isProcessing) {
      try {
        await this.processBatch()
        await this.sleep(this.pollInterval)
      } catch (error) {
        console.error('Error in job processing loop:', error)
        await this.sleep(this.pollInterval)
      }
    }
  }

  // Process a batch of jobs
  private async processBatch(): Promise<void> {
    const jobs = await this.getPendingJobs(this.concurrency)

    if (jobs.length === 0) return

    // Process jobs in parallel
    await Promise.all(
      jobs.map(job => this.processJob(job))
    )
  }

  // Get pending jobs from database
  private async getPendingJobs(limit: number): Promise<Job[]> {
    const now = new Date()

    const jobs = await db.backgroundJob.findMany({
      where: {
        status: 'pending',
        scheduledAt: {
          lte: now
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' }
      ],
      take: limit
    })

    return jobs as Job[]
  }

  // Process a single job
  private async processJob(job: Job): Promise<void> {
    // Parse payload and result for convenience
    try {
      job.parsedPayload = JSON.parse(job.payload)
    } catch (error) {
      console.error(`Failed to parse payload for job ${job.id}:`, error)
      await this.failJob(job.id, 'Invalid payload format')
      return
    }

    if (job.result) {
      try {
        job.parsedResult = JSON.parse(job.result)
      } catch (error) {
        // Ignore parsing errors for existing results
      }
    }

    const handler = this.handlers.get(job.type)
    if (!handler) {
      console.error(`No handler found for job type: ${job.type}`)
      await this.failJob(job.id, 'No handler found')
      return
    }

    try {
      // Update job status to processing
      await db.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: 'processing',
          startedAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Execute the job handler
      const result = await handler.handler(job)

      // Mark job as completed
      await db.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          result: JSON.stringify(result),
          completedAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`Job ${job.id} (${job.type}) completed successfully`)
    } catch (error) {
      console.error(`Job ${job.id} (${job.type}) failed:`, error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const shouldRetry = job.attempts + 1 < (handler.maxAttempts || job.maxAttempts)

      if (shouldRetry) {
        // Schedule retry
        const retryDelay = handler.retryDelay || this.calculateRetryDelay(job.attempts + 1)
        const scheduledAt = new Date(Date.now() + retryDelay)

        await db.backgroundJob.update({
          where: { id: job.id },
          data: {
            status: 'pending',
            attempts: job.attempts + 1,
            errorMessage,
            scheduledAt,
            updatedAt: new Date()
          }
        })

        console.log(`Job ${job.id} scheduled for retry in ${retryDelay}ms`)
      } else {
        // Mark as failed
        await this.failJob(job.id, errorMessage)
      }
    }
  }

  // Mark job as failed
  private async failJob(jobId: string, errorMessage: string): Promise<void> {
    await db.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errorMessage,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  // Calculate retry delay with exponential backoff
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = 1000 // 1 second
    const maxDelay = 5 * 60 * 1000 // 5 minutes
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)

    // Add some randomness to prevent thundering herd
    return delay + Math.random() * 1000
  }

  // Utility function for sleep
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get job statistics
  async getStats(): Promise<{
    pending: number
    processing: number
    completed: number
    failed: number
    total: number
  }> {
    const stats = await db.backgroundJob.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const result = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: 0
    }

    stats.forEach(stat => {
      result[stat.status as keyof typeof result] = stat._count.status
      result.total += stat._count.status
    })

    return result
  }

  // Clean up old completed jobs
  async cleanup(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await db.backgroundJob.deleteMany({
      where: {
        status: 'completed',
        completedAt: {
          lt: cutoffDate
        }
      }
    })

    return result.count
  }

  // Retry failed jobs
  async retryFailedJobs(jobType?: string): Promise<number> {
    const where: any = {
      status: 'failed'
    }

    if (jobType) {
      where.type = jobType
    }

    const result = await db.backgroundJob.updateMany({
      where,
      data: {
        status: 'pending',
        attempts: 0,
        scheduledAt: new Date(),
        updatedAt: new Date()
      }
    })

    return result.count
  }
}

// Create global job queue instance
export const jobQueue = new BackgroundJobQueue()

// Pre-defined job handlers
export const jobHandlers = {
  // Send email notification
  sendEmail: {
    type: 'sendEmail',
    handler: async (job: Job) => {
      const { to, subject, body, from } = job.parsedPayload

      // Simulate email sending
      console.log(`Sending email to ${to}: ${subject}`)

      // In a real implementation, you would use an email service
      // await emailService.send({ to, subject, body, from })

      return { messageId: `msg_${Date.now()}`, sentAt: new Date() }
    },
    maxAttempts: 3,
    retryDelay: 60000 // 1 minute
  },

  // Process webhook alert
  processWebhookAlert: {
    type: 'processWebhookAlert',
    handler: async (job: Job) => {
      const { alertId, webhookId } = job.parsedPayload

      // Get the alert and webhook
      const alert = await db.alert.findUnique({
        where: { id: alertId },
        include: {
          webhook: true,
          deliveries: {
            include: {
              channel: true
            }
          }
        }
      })

      if (!alert) {
        throw new Error('Alert not found')
      }

      // Process each delivery
      for (const delivery of alert.deliveries) {
        try {
          // Simulate processing
          console.log(`Processing delivery ${delivery.id} for channel ${delivery.channel.name}`)

          // Update delivery status
          await db.alertDelivery.update({
            where: { id: delivery.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              response: 'Successfully processed'
            }
          })
        } catch (error) {
          await db.alertDelivery.update({
            where: { id: delivery.id },
            data: {
              status: 'FAILED',
              response: error instanceof Error ? error.message : 'Processing failed'
            }
          })
        }
      }

      return { processedDeliveries: alert.deliveries.length }
    },
    maxAttempts: 5,
    retryDelay: 30000 // 30 seconds
  },

  // Generate analytics report
  generateAnalyticsReport: {
    type: 'generateAnalyticsReport',
    handler: async (job: Job) => {
      const { startDate, endDate } = job.parsedPayload

      // Generate analytics data
      const [totalAlerts, successfulDeliveries, failedDeliveries] = await Promise.all([
        db.alert.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        db.alertDelivery.count({
          where: {
            status: 'SENT',
            sentAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        db.alertDelivery.count({
          where: {
            status: 'FAILED',
            sentAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ])

      const report = {
        period: { startDate, endDate },
        totalAlerts,
        successfulDeliveries,
        failedDeliveries,
        successRate: totalAlerts > 0 ? (successfulDeliveries / totalAlerts) * 100 : 0,
        generatedAt: new Date()
      }

      // Store report
      await db.analyticsReport.create({
        data: {
          period: `${startDate.toISOString()}_${endDate.toISOString()}`,
          data: JSON.stringify(report)
        }
      })

      return report
    },
    maxAttempts: 2,
    retryDelay: 60000 // 1 minute
  },

  // Cleanup old data
  cleanupOldData: {
    type: 'cleanupOldData',
    handler: async (job: Job) => {
      const { olderThanDays = 90 } = job.parsedPayload
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      // Clean up old alerts
      const deletedAlerts = await db.alert.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          deliveries: {
            every: {
              status: 'DELIVERED'
            }
          }
        }
      })

      // Clean up old failed deliveries
      const deletedDeliveries = await db.alertDelivery.deleteMany({
        where: {
          status: 'FAILED',
          sentAt: {
            lt: cutoffDate
          }
        }
      })

      return {
        deletedAlerts: deletedAlerts.count,
        deletedDeliveries: deletedDeliveries.count,
        cutoffDate
      }
    },
    maxAttempts: 1,
    retryDelay: 0 // No retry for cleanup jobs
  }
}

// Register all job handlers
Object.values(jobHandlers).forEach(handler => {
  jobQueue.registerHandler(handler)
})

// Utility functions for common background jobs
export const backgroundJobs = {
  // Send email
  sendEmail: (to: string, subject: string, body: string, from?: string) =>
    jobQueue.addJob('sendEmail', { to, subject, body, from }, { priority: 'medium' }),

  // Process webhook alert
  processWebhookAlert: (alertId: string, webhookId: string) =>
    jobQueue.addJob('processWebhookAlert', { alertId, webhookId }, { priority: 'high' }),

  // Generate analytics report
  generateAnalyticsReport: (startDate: Date, endDate: Date) =>
    jobQueue.addJob('generateAnalyticsReport', { startDate, endDate }, { priority: 'low' }),

  // Schedule cleanup
  scheduleCleanup: (olderThanDays: number = 90) =>
    jobQueue.addJob('cleanupOldData', { olderThanDays }, {
      priority: 'low',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Schedule for tomorrow
    }),

  // Get job queue statistics
  getStats: () => jobQueue.getStats(),

  // Cleanup old jobs
  cleanup: (olderThanDays?: number) => jobQueue.cleanup(olderThanDays),

  // Retry failed jobs
  retryFailedJobs: (jobType?: string) => jobQueue.retryFailedJobs(jobType)
}