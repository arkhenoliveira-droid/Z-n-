import { Web3LinuxKernel } from '@/kernel/web3-linux-kernel'
import { SystemMetrics } from '@/app/api/system/metrics/route'
import { SystemProcess } from '@/app/api/processes/route'
import { FileSystemEntry } from '@/app/api/filesystem/route'
import { BlockchainInfo } from '@/app/api/blockchain/route'
import { SmartContract } from '@/app/api/contracts/route'

export interface MonitoringConfig {
  updateInterval: number
  enableRealTimeUpdates: boolean
  metricsRetentionPeriod: number
  alertThresholds: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkLatency: number
    blockchainSyncDelay: number
  }
}

export interface SystemAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  category: 'system' | 'security' | 'performance' | 'blockchain'
  message: string
  timestamp: Date
  chronon: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  metadata: Record<string, any>
}

export class SystemMonitor {
  private kernel: Web3LinuxKernel
  private config: MonitoringConfig
  private metrics: SystemMetrics[] = []
  private alerts: SystemAlert[] = []
  private updateInterval?: NodeJS.Timeout
  private isRunning = false

  constructor(kernel: Web3LinuxKernel, config: MonitoringConfig) {
    this.kernel = kernel
    this.config = config
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('System monitor is already running')
      return
    }

    console.log('Starting system monitor...')
    this.isRunning = true

    // Start periodic metrics collection
    this.updateInterval = setInterval(async () => {
      await this.collectMetrics()
      await this.checkAlerts()
    }, this.config.updateInterval)

    // Initial metrics collection
    await this.collectMetrics()

    console.log('System monitor started successfully')
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('System monitor is not running')
      return
    }

    console.log('Stopping system monitor...')
    this.isRunning = false

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = undefined
    }

    console.log('System monitor stopped successfully')
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Get system state from kernel
      const systemState = await this.kernel.getSystemState()

      // Convert to metrics format
      const metrics: SystemMetrics = {
        cpu: {
          usage: systemState.processes.reduce((sum, p) => sum + p.cpuUsage, 0) / systemState.processes.length || 0,
          cores: 8, // This should come from system info
          frequency: 3200, // This should come from system info
          temperature: 45 + Math.random() * 10 // Simulated temperature
        },
        memory: {
          total: systemState.filesystem.totalSpace,
          used: systemState.filesystem.usedSpace,
          free: systemState.filesystem.freeSpace,
          cached: Math.floor(Math.random() * 2048),
          buffers: Math.floor(Math.random() * 1024)
        },
        storage: {
          total: systemState.filesystem.totalSpace,
          used: systemState.filesystem.usedSpace,
          free: systemState.filesystem.freeSpace,
          readSpeed: Math.random() * 1000,
          writeSpeed: Math.random() * 1000
        },
        network: {
          bytesIn: systemState.network.bandwidth.incoming,
          bytesOut: systemState.network.bandwidth.outgoing,
          packetsIn: Math.floor(Math.random() * 10000),
          packetsOut: Math.floor(Math.random() * 10000),
          connections: systemState.network.connections
        },
        blockchain: {
          syncProgress: systemState.network.blockchainSync ? 100 : 0,
          currentBlock: Math.floor(Math.random() * 1000000),
          latestBlock: Math.floor(Math.random() * 1000000),
          chronon: systemState.chronon.number,
          networkStatus: systemState.network.blockchainSync ? 'synced' : 'syncing'
        },
        uptime: systemState.uptime,
        loadAverage: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
        processes: {
          total: systemState.processes.length,
          running: systemState.processes.filter(p => p.state === 'running').length,
          sleeping: systemState.processes.filter(p => p.state === 'sleeping').length,
          stopped: systemState.processes.filter(p => p.state === 'stopped').length,
          zombie: systemState.processes.filter(p => p.state === 'zombie').length
        }
      }

      // Store metrics with timestamp
      this.metrics.push({
        ...metrics,
        timestamp: new Date()
      })

      // Retain only recent metrics
      const cutoffTime = new Date(Date.now() - this.config.metricsRetentionPeriod)
      this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime)

      // Emit real-time update if enabled
      if (this.config.enableRealTimeUpdates) {
        this.emitRealTimeUpdate('metrics', metrics)
      }

    } catch (error) {
      console.error('Error collecting system metrics:', error)
      this.createAlert('error', 'system', 'Failed to collect system metrics', 'high', { error })
    }
  }

  private async checkAlerts(): Promise<void> {
    if (this.metrics.length === 0) return

    const latestMetrics = this.metrics[this.metrics.length - 1]
    const thresholds = this.config.alertThresholds

    // Check CPU usage
    if (latestMetrics.cpu.usage > thresholds.cpuUsage) {
      this.createAlert(
        'warning',
        'performance',
        `High CPU usage: ${latestMetrics.cpu.usage.toFixed(1)}%`,
        'medium',
        { current: latestMetrics.cpu.usage, threshold: thresholds.cpuUsage }
      )
    }

    // Check memory usage
    const memoryUsagePercent = (latestMetrics.memory.used / latestMetrics.memory.total) * 100
    if (memoryUsagePercent > thresholds.memoryUsage) {
      this.createAlert(
        'warning',
        'performance',
        `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,
        'medium',
        { current: memoryUsagePercent, threshold: thresholds.memoryUsage }
      )
    }

    // Check disk usage
    const diskUsagePercent = (latestMetrics.storage.used / latestMetrics.storage.total) * 100
    if (diskUsagePercent > thresholds.diskUsage) {
      this.createAlert(
        'warning',
        'system',
        `High disk usage: ${diskUsagePercent.toFixed(1)}%`,
        'medium',
        { current: diskUsagePercent, threshold: thresholds.diskUsage }
      )
    }

    // Check blockchain sync
    if (latestMetrics.blockchain.networkStatus === 'syncing') {
      const syncDelay = latestMetrics.blockchain.latestBlock - latestMetrics.blockchain.currentBlock
      if (syncDelay > thresholds.blockchainSyncDelay) {
        this.createAlert(
          'warning',
          'blockchain',
          `Blockchain sync delay: ${syncDelay} blocks`,
          'high',
          { current: syncDelay, threshold: thresholds.blockchainSyncDelay }
        )
      }
    }

    // Check zombie processes
    if (latestMetrics.processes.zombie > 0) {
      this.createAlert(
        'warning',
        'system',
        `Zombie processes detected: ${latestMetrics.processes.zombie}`,
        'medium',
        { count: latestMetrics.processes.zombie }
      )
    }
  }

  private createAlert(
    type: 'warning' | 'error' | 'info',
    category: 'system' | 'security' | 'performance' | 'blockchain',
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata: Record<string, any>
  ): void {
    const alert: SystemAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      message,
      timestamp: new Date(),
      chronon: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].blockchain.chronon : 0,
      severity,
      resolved: false,
      metadata
    }

    this.alerts.push(alert)

    // Emit real-time alert if enabled
    if (this.config.enableRealTimeUpdates) {
      this.emitRealTimeUpdate('alert', alert)
    }

    console.log(`Alert created: [${severity.toUpperCase()}] ${message}`)
  }

  private emitRealTimeUpdate(type: string, data: any): void {
    // This would integrate with WebSocket or other real-time communication
    // For now, we'll just log it
    console.log(`Real-time update [${type}]:`, data)
  }

  // Public methods for accessing monitoring data
  getMetrics(limit?: number): SystemMetrics[] {
    if (limit) {
      return this.metrics.slice(-limit)
    }
    return [...this.metrics]
  }

  getAlerts(resolved?: boolean): SystemAlert[] {
    if (resolved !== undefined) {
      return this.alerts.filter(a => a.resolved === resolved)
    }
    return [...this.alerts]
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      if (this.config.enableRealTimeUpdates) {
        this.emitRealTimeUpdate('alert_resolved', alert)
      }
      return true
    }
    return false
  }

  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical'
    score: number
    issues: string[]
    metrics: SystemMetrics | null
  } {
    if (this.metrics.length === 0) {
      return {
        status: 'critical',
        score: 0,
        issues: ['No metrics available'],
        metrics: null
      }
    }

    const latestMetrics = this.metrics[this.metrics.length - 1]
    const issues: string[] = []
    let score = 100

    // Check CPU
    if (latestMetrics.cpu.usage > this.config.alertThresholds.cpuUsage) {
      score -= 20
      issues.push(`High CPU usage: ${latestMetrics.cpu.usage.toFixed(1)}%`)
    }

    // Check Memory
    const memoryUsagePercent = (latestMetrics.memory.used / latestMetrics.memory.total) * 100
    if (memoryUsagePercent > this.config.alertThresholds.memoryUsage) {
      score -= 20
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`)
    }

    // Check Disk
    const diskUsagePercent = (latestMetrics.storage.used / latestMetrics.storage.total) * 100
    if (diskUsagePercent > this.config.alertThresholds.diskUsage) {
      score -= 15
      issues.push(`High disk usage: ${diskUsagePercent.toFixed(1)}%`)
    }

    // Check Blockchain
    if (latestMetrics.blockchain.networkStatus !== 'synced') {
      score -= 25
      issues.push('Blockchain not synced')
    }

    // Check Zombie Processes
    if (latestMetrics.processes.zombie > 0) {
      score -= 10
      issues.push(`Zombie processes: ${latestMetrics.processes.zombie}`)
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (score < 50) {
      status = 'critical'
    } else if (score < 80) {
      status = 'warning'
    }

    return {
      status,
      score: Math.max(0, score),
      issues,
      metrics: latestMetrics
    }
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('System monitor configuration updated')
  }
}