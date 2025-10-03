import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { SystemMetrics } from '@/app/api/system/metrics/route'
import { SystemProcess } from '@/app/api/processes/route'
import { SystemAlert } from './system-monitor'

export interface RealTimeUpdate {
  type: 'metrics' | 'process' | 'alert' | 'blockchain' | 'filesystem' | 'contract'
  data: any
  timestamp: Date
  chronon: number
}

export interface RealTimeConfig {
  enabled: boolean
  updateInterval: number
  maxClients: number
  authRequired: boolean
  rateLimit: {
    enabled: boolean
    maxRequests: number
    windowMs: number
  }
}

export class RealTimeUpdateService {
  private io: ServerIO
  private config: RealTimeConfig
  private clients: Set<string> = new Set()
  private metricsInterval?: NodeJS.Timeout
  private isRunning = false

  constructor(server: NetServer, config: RealTimeConfig) {
    this.io = new ServerIO(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    })

    this.config = config
    this.setupSocketHandlers()
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`)
      this.clients.add(socket.id)

      // Send initial data
      this.sendInitialData(socket)

      // Handle client events
      socket.on('subscribe', (channels: string[]) => {
        console.log(`Client ${socket.id} subscribed to channels:`, channels)
        channels.forEach(channel => {
          socket.join(channel)
        })
      })

      socket.on('unsubscribe', (channels: string[]) => {
        console.log(`Client ${socket.id} unsubscribed from channels:`, channels)
        channels.forEach(channel => {
          socket.leave(channel)
        })
      })

      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date() })
      })

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
        this.clients.delete(socket.id)
      })

      // Handle authentication if required
      if (this.config.authRequired) {
        socket.on('authenticate', (token: string) => {
          // In a real implementation, validate the token
          if (token && token.length > 0) {
            socket.emit('authenticated', { success: true })
          } else {
            socket.emit('authenticated', { success: false })
            socket.disconnect()
          }
        })
      }
    })
  }

  private async sendInitialData(socket: any): Promise<void> {
    try {
      // Send initial system metrics
      const metricsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/system/metrics`)
      if (metricsResponse.ok) {
        const metrics = await metricsResponse.json()
        socket.emit('initial_metrics', metrics)
      }

      // Send initial processes
      const processesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/processes`)
      if (processesResponse.ok) {
        const processes = await processesResponse.json()
        socket.emit('initial_processes', processes)
      }

      // Send initial blockchain info
      const blockchainResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blockchain`)
      if (blockchainResponse.ok) {
        const blockchain = await blockchainResponse.json()
        socket.emit('initial_blockchain', blockchain)
      }

    } catch (error) {
      console.error('Error sending initial data:', error)
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Real-time update service is already running')
      return
    }

    console.log('Starting real-time update service...')
    this.isRunning = true

    if (this.config.enabled) {
      // Start periodic metrics updates
      this.metricsInterval = setInterval(async () => {
        await this.broadcastMetrics()
      }, this.config.updateInterval)

      console.log('Real-time update service started successfully')
    } else {
      console.log('Real-time updates are disabled')
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Real-time update service is not running')
      return
    }

    console.log('Stopping real-time update service...')
    this.isRunning = false

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = undefined
    }

    // Close all client connections
    this.io.close()
    this.clients.clear()

    console.log('Real-time update service stopped successfully')
  }

  private async broadcastMetrics(): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/system/metrics`)
      if (response.ok) {
        const metrics: SystemMetrics = await response.json()

        const update: RealTimeUpdate = {
          type: 'metrics',
          data: metrics,
          timestamp: new Date(),
          chronon: metrics.blockchain.chronon
        }

        this.io.to('metrics').emit('metrics_update', update)
        this.io.emit('system_update', update)
      }
    } catch (error) {
      console.error('Error broadcasting metrics:', error)
    }
  }

  // Public methods for sending updates
  sendUpdate(type: RealTimeUpdate['type'], data: any, chronon?: number): void {
    const update: RealTimeUpdate = {
      type,
      data,
      timestamp: new Date(),
      chronon: chronon || 0
    }

    // Send to specific channels based on type
    switch (type) {
      case 'metrics':
        this.io.to('metrics').emit('metrics_update', update)
        break
      case 'process':
        this.io.to('processes').emit('process_update', update)
        break
      case 'alert':
        this.io.to('alerts').emit('alert_update', update)
        this.io.emit('system_alert', update) // Also send to all clients
        break
      case 'blockchain':
        this.io.to('blockchain').emit('blockchain_update', update)
        break
      case 'filesystem':
        this.io.to('filesystem').emit('filesystem_update', update)
        break
      case 'contract':
        this.io.to('contracts').emit('contract_update', update)
        break
      default:
        this.io.emit('general_update', update)
    }

    // Also send to general update channel
    this.io.emit('real_time_update', update)
  }

  sendAlert(alert: SystemAlert): void {
    this.sendUpdate('alert', alert, alert.chronon)
  }

  sendProcessUpdate(process: SystemProcess): void {
    this.sendUpdate('process', process, process.chronon)
  }

  sendBlockchainUpdate(blockchainInfo: any): void {
    this.sendUpdate('blockchain', blockchainInfo, blockchainInfo.chronon)
  }

  sendFilesystemUpdate(filesystemData: any): void {
    this.sendUpdate('filesystem', filesystemData, 0)
  }

  sendContractUpdate(contractData: any): void {
    this.sendUpdate('contract', contractData, 0)
  }

  // Statistics and monitoring
  getStats(): {
    connectedClients: number
    isRunning: boolean
    config: RealTimeConfig
    uptime: number
  } {
    return {
      connectedClients: this.clients.size,
      isRunning: this.isRunning,
      config: this.config,
      uptime: process.uptime()
    }
  }

  updateConfig(newConfig: Partial<RealTimeConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Restart service if update interval changed
    if (newConfig.updateInterval !== undefined && this.isRunning) {
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval)
      }

      if (this.config.enabled) {
        this.metricsInterval = setInterval(async () => {
          await this.broadcastMetrics()
        }, this.config.updateInterval)
      }
    }

    console.log('Real-time update service configuration updated')
  }

  // Broadcast message to all clients
  broadcast(message: string, data?: any): void {
    this.io.emit('broadcast', {
      message,
      data,
      timestamp: new Date()
    })
  }

  // Send message to specific client
  sendToClient(clientId: string, event: string, data: any): void {
    this.io.to(clientId).emit(event, data)
  }

  // Send message to specific room/channel
  sendToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data)
  }
}

// Singleton instance management
let realTimeServiceInstance: RealTimeUpdateService | null = null

export function initializeRealTimeService(server: NetServer, config: RealTimeConfig): RealTimeUpdateService {
  if (!realTimeServiceInstance) {
    realTimeServiceInstance = new RealTimeUpdateService(server, config)
  }
  return realTimeServiceInstance
}

export function getRealTimeService(): RealTimeUpdateService | null {
  return realTimeServiceInstance
}

export function destroyRealTimeService(): void {
  if (realTimeServiceInstance) {
    realTimeServiceInstance.stop()
    realTimeServiceInstance = null
  }
}