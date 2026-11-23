const jwt = require('jsonwebtoken');
const db = require('../utils/db');

const connectedUsers = new Map();

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Auth required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db('users').where('id', decoded.id).select('id','name','role','initials','color').first();
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (e) { next(new Error('Invalid token')); }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.user.name} connected`);
    connectedUsers.set(socket.user.id, socket.id);
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);
    io.emit('user:online', { userId: socket.user.id, name: socket.user.name });

    socket.on('job:join',     (jobId) => socket.join(`job:${jobId}`));
    socket.on('job:leave',    (jobId) => socket.leave(`job:${jobId}`));
    socket.on('job:progress', ({ jobId, progress }) => io.emit('job:progress:update', { jobId, progress, updatedBy: socket.user }));
    socket.on('comment:typing',     ({ jobId }) => socket.to(`job:${jobId}`).emit('comment:typing',     { user: socket.user }));
    socket.on('comment:stop-typing',({ jobId }) => socket.to(`job:${jobId}`).emit('comment:stop-typing',{ user: socket.user }));

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.user.id);
      io.emit('user:offline', { userId: socket.user.id });
    });
  });

  console.log('✅ Socket.io initialized');
};

module.exports = { initSocket, connectedUsers };
