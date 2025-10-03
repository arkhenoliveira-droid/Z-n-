import { Server as SocketIOServer } from 'socket.io'

// Global socket.io server instance
let globalIo: SocketIOServer | null = null

export const setGlobalIo = (io: SocketIOServer) => {
  globalIo = io
}

export const getGlobalIo = (): SocketIOServer | null => {
  return globalIo
}

export const emitToConstantsRoom = (event: string, data: any) => {
  if (globalIo) {
    globalIo.to('constants').emit(event, data)
  }
}

export const emitToWebhookRoom = (event: string, data: any) => {
  if (globalIo) {
    globalIo.to('webhooks').emit(event, data)
  }
}