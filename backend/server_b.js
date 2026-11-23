const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initSocket } = require('./socket/socket');
const { startWatcher } = require('./services/deadline.service');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true } });

initSocket(io);
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 PulseDesk API on port ${PORT}`);
  console.log(`📡 WebSocket ready`);
  console.log(`🌍 Env: ${process.env.NODE_ENV || 'development'}\n`);
  startWatcher(io);
});
