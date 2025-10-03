'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface RealTimeEvent {
  type: 'webhook' | 'alert' | 'channel' | 'stats'
  action: 'created' | 'updated' | 'deleted' | 'received' | 'processed' | 'delivered' | 'failed'
  data: any
  timestamp: string
}

export const useRealTimeUpdates = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      setIsConnected(true)
      setConnectionError(null)
      console.log('WebSocket connected')
    })

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('WebSocket disconnected:', reason)
    })

    socketInstance.on('connect_error', (error) => {
      setConnectionError(error.message)
      setIsConnected(false)
      console.error('WebSocket connection error:', error)
    })

    // Handle all real-time events
    const handleRealTimeEvent = (eventType: string, action: string, data: any) => {
      const event: RealTimeEvent = {
        type: eventType as 'webhook' | 'alert' | 'channel' | 'stats',
        action: action as any,
        data,
        timestamp: new Date().toISOString()
      }
      setLastEvent(event)
    }

    // Webhook events
    socketInstance.on('webhook:created', (data) => handleRealTimeEvent('webhook', 'created', data))
    socketInstance.on('webhook:updated', (data) => handleRealTimeEvent('webhook', 'updated', data))
    socketInstance.on('webhook:deleted', (data) => handleRealTimeEvent('webhook', 'deleted', data))

    // Alert events
    socketInstance.on('alert:received', (data) => handleRealTimeEvent('alert', 'received', data))
    socketInstance.on('alert:processed', (data) => handleRealTimeEvent('alert', 'processed', data))
    socketInstance.on('alert:delivered', (data) => handleRealTimeEvent('alert', 'delivered', data))
    socketInstance.on('alert:failed', (data) => handleRealTimeEvent('alert', 'failed', data))

    // Channel events
    socketInstance.on('channel:created', (data) => handleRealTimeEvent('channel', 'created', data))
    socketInstance.on('channel:updated', (data) => handleRealTimeEvent('channel', 'updated', data))
    socketInstance.on('channel:deleted', (data) => handleRealTimeEvent('channel', 'deleted', data))

    // Stats events
    socketInstance.on('stats:updated', (data) => handleRealTimeEvent('stats', 'updated', data))

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const emitEvent = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  return {
    isConnected,
    connectionError,
    lastEvent,
    emitEvent,
    socket
  }
}