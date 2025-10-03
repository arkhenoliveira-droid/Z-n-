import { NextRequest, NextResponse } from 'next/server'

export interface SystemProcess {
  id: string
  name: string
  pid: number
  state: 'running' | 'sleeping' | 'stopped' | 'zombie'
  cpuUsage: number
  memoryUsage: number
  startTime: Date
  user: string
  temporalProof: string
  chronon: number
  command: string
  parentPid?: number
  threads: number
  priority: number
  nice: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') || 'all'

    // Simulate process data
    const processes: SystemProcess[] = [
      {
        id: '1',
        name: 'web3-kernel',
        pid: 1,
        state: 'running',
        cpuUsage: Math.random() * 10,
        memoryUsage: Math.random() * 500,
        startTime: new Date(Date.now() - 3600000),
        user: 'root',
        temporalProof: '0x' + Math.random().toString(16).substr(2, 64),
        chronon: Math.floor(Math.random() * 10000),
        command: '/usr/bin/web3-kernel --daemon',
        parentPid: 0,
        threads: 5,
        priority: 0,
        nice: 0
      },
      {
        id: '2',
        name: 'timechain-sync',
        pid: 2,
        state: 'running',
        cpuUsage: Math.random() * 15,
        memoryUsage: Math.random() * 300,
        startTime: new Date(Date.now() - 1800000),
        user: 'timechain',
        temporalProof: '0x' + Math.random().toString(16).substr(2, 64),
        chronon: Math.floor(Math.random() * 10000),
        command: '/usr/bin/timechain-sync --network=mainnet',
        parentPid: 1,
        threads: 3,
        priority: 0,
        nice: 0
      },
      {
        id: '3',
        name: 'temporal-fs',
        pid: 3,
        state: 'running',
        cpuUsage: Math.random() * 5,
        memoryUsage: Math.random() * 200,
        startTime: new Date(Date.now() - 900000),
        user: 'root',
        temporalProof: '0x' + Math.random().toString(16).substr(2, 64),
        chronon: Math.floor(Math.random() * 10000),
        command: '/usr/bin/temporal-fs --mount=/',
        parentPid: 1,
        threads: 2,
        priority: 0,
        nice: 0
      },
      {
        id: '4',
        name: 'blockchain-node',
        pid: 4,
        state: 'running',
        cpuUsage: Math.random() * 25,
        memoryUsage: Math.random() * 1000,
        startTime: new Date(Date.now() - 7200000),
        user: 'blockchain',
        temporalProof: '0x' + Math.random().toString(16).substr(2, 64),
        chronon: Math.floor(Math.random() * 10000),
        command: '/usr/bin/blockchain-node --validator',
        parentPid: 1,
        threads: 8,
        priority: -5,
        nice: -5
      },
      {
        id: '5',
        name: 'web3-shell',
        pid: 100,
        state: 'sleeping',
        cpuUsage: Math.random() * 1,
        memoryUsage: Math.random() * 50,
        startTime: new Date(Date.now() - 300000),
        user: 'user',
        temporalProof: '0x' + Math.random().toString(16).substr(2, 64),
        chronon: Math.floor(Math.random() * 10000),
        command: '/usr/bin/web3-shell',
        parentPid: 1000,
        threads: 1,
        priority: 0,
        nice: 0
      }
    ]

    // Filter processes based on state
    let filteredProcesses = processes
    if (filter !== 'all') {
      filteredProcesses = processes.filter(p => p.state === filter)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProcesses = filteredProcesses.slice(startIndex, endIndex)

    return NextResponse.json({
      data: paginatedProcesses,
      pagination: {
        page,
        limit,
        total: filteredProcesses.length,
        totalPages: Math.ceil(filteredProcesses.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching processes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch processes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { command, args, priority, nice } = body

    // Simulate process creation
    const newProcess: SystemProcess = {
      id: Date.now().toString(),
      name: command.split(' ')[0],
      pid: Math.floor(Math.random() * 10000) + 1000,
      state: 'running',
      cpuUsage: 0,
      memoryUsage: Math.random() * 100,
      startTime: new Date(),
      user: 'current-user',
      temporalProof: '0x' + Math.random().toString(16).substr(2, 64),
      chronon: Math.floor(Math.random() * 10000),
      command: `${command} ${args?.join(' ') || ''}`,
      parentPid: 1,
      threads: 1,
      priority: priority || 0,
      nice: nice || 0
    }

    return NextResponse.json(newProcess, { status: 201 })
  } catch (error) {
    console.error('Error creating process:', error)
    return NextResponse.json(
      { error: 'Failed to create process' },
      { status: 500 }
    )
  }
}