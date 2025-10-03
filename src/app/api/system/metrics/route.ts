import { NextRequest, NextResponse } from 'next/server'

export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    frequency: number
    temperature: number
  }
  memory: {
    total: number
    used: number
    free: number
    cached: number
    buffers: number
  }
  storage: {
    total: number
    used: number
    free: number
    readSpeed: number
    writeSpeed: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
    connections: number
  }
  blockchain: {
    syncProgress: number
    currentBlock: number
    latestBlock: number
    chronon: number
    networkStatus: 'syncing' | 'synced' | 'error'
  }
  uptime: number
  loadAverage: [number, number, number]
  processes: {
    total: number
    running: number
    sleeping: number
    stopped: number
    zombie: number
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simulate real system metrics collection
    // In a real implementation, this would interface with the actual system
    const metrics: SystemMetrics = {
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        frequency: 3200,
        temperature: 40 + Math.random() * 20
      },
      memory: {
        total: 16384,
        used: 8192 + Math.random() * 4000,
        free: 8192 - Math.random() * 4000,
        cached: 2048,
        buffers: 1024
      },
      storage: {
        total: 1000000,
        used: 500000 + Math.random() * 100000,
        free: 500000 - Math.random() * 100000,
        readSpeed: Math.random() * 1000,
        writeSpeed: Math.random() * 1000
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 10000,
        connections: Math.floor(Math.random() * 100)
      },
      blockchain: {
        syncProgress: 100,
        currentBlock: Math.floor(Math.random() * 1000000),
        latestBlock: Math.floor(Math.random() * 1000000),
        chronon: Math.floor(Math.random() * 10000),
        networkStatus: 'synced'
      },
      uptime: Math.floor(Math.random() * 86400),
      loadAverage: [
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
      ],
      processes: {
        total: Math.floor(Math.random() * 200) + 100,
        running: Math.floor(Math.random() * 10) + 1,
        sleeping: Math.floor(Math.random() * 150) + 50,
        stopped: Math.floor(Math.random() * 10),
        zombie: Math.floor(Math.random() * 5)
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    )
  }
}