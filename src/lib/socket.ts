import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join rooms for real-time updates
    socket.join('webhooks');
    socket.join('alerts');
    socket.join('channels');

    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle webhook events
    socket.on('webhook:created', (data) => {
      io.to('webhooks').emit('webhook:created', data);
    });

    socket.on('webhook:updated', (data) => {
      io.to('webhooks').emit('webhook:updated', data);
    });

    socket.on('webhook:deleted', (data) => {
      io.to('webhooks').emit('webhook:deleted', data);
    });

    // Handle alert events
    socket.on('alert:received', (data) => {
      io.to('alerts').emit('alert:received', data);
    });

    socket.on('alert:processed', (data) => {
      io.to('alerts').emit('alert:processed', data);
    });

    socket.on('alert:delivered', (data) => {
      io.to('alerts').emit('alert:delivered', data);
    });

    socket.on('alert:failed', (data) => {
      io.to('alerts').emit('alert:failed', data);
    });

    // Handle channel events
    socket.on('channel:created', (data) => {
      io.to('channels').emit('channel:created', data);
    });

    socket.on('channel:updated', (data) => {
      io.to('channels').emit('channel:updated', data);
    });

    socket.on('channel:deleted', (data) => {
      io.to('channels').emit('channel:deleted', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      socket.leave('webhooks');
      socket.leave('alerts');
      socket.leave('channels');
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to Webhook Manager WebSocket!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};