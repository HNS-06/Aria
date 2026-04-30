import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup HTTP Server and Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { 
    origin: '*', 
    methods: ['GET', 'POST'] 
  },
});

app.use(cors());
app.use(express.json());

// ── Socket.io Events ──
io.on('connection', (socket) => {
  console.log('[Socket] Client connected:', socket.id);

  socket.on('TASK_CREATED', (data) => {
    console.log('[Socket] Task Created:', data);
    socket.broadcast.emit('TASK_SYNC', data);
  });

  socket.on('MISSION_UPDATED', (data) => {
    console.log('[Socket] Mission Updated:', data.missions.length, 'active missions.');
    socket.broadcast.emit('MISSION_SYNC', data);
  });

  socket.on('XP_GAINED', (data) => {
    console.log('[Socket] XP Gained:', data.xp, 'Level:', data.level);
    socket.broadcast.emit('STATS_SYNC', data);
  });

  socket.on('NEURAL_SYNC', (data) => {
    console.log('[Socket] Neural Sync Heartbeat:', data.status);
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected:', socket.id);
  });
});

// ── API Routes ──
app.get('/api/status', (req, res) => {
  res.json({ status: 'ARIA Systems Online', version: '1.0.0' });
});

app.post('/api/sync', (req, res) => {
  const { type, data } = req.body;
  console.log(`[Sync] Received ${type}:`, data);
  res.json({ success: true });
});

httpServer.listen(PORT, () => {
  console.log(`\n  🚀 ARIA Intelligence Backend running on http://localhost:${PORT}`);
  console.log(`  🔌 Neural Uplink (Socket.io) active\n`);
});
