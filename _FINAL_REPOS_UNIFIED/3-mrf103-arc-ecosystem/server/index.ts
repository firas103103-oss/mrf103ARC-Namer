/**
 * MRF103 ARC Ecosystem - Server Entry Point
 * Enterprise AI Agent Management Platform
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// =============================================================================
// Configuration
// =============================================================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =============================================================================
// Express App Setup
// =============================================================================

const app = express();
const httpServer = createServer(app);

// Socket.IO Setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: NODE_ENV === 'production' ? 'https://app.mrf103.com' : '*',
    methods: ['GET', 'POST'],
  },
});

// =============================================================================
// Middleware
// =============================================================================

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// =============================================================================
// Health Check
// =============================================================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// =============================================================================
// System Metrics
// =============================================================================

app.get('/api/metrics', (_req: Request, res: Response) => {
  res.json({
    agents: {
      total: 31,
      active: 28,
      idle: 3,
    },
    system: {
      cpu: Math.random() * 30 + 10,
      memory: Math.random() * 40 + 30,
      requests: Math.floor(Math.random() * 1000 + 500),
    },
    performance: {
      avgResponseTime: Math.random() * 50 + 20,
      successRate: 99.9,
      cacheHitRate: 85.5,
    },
  });
});

// =============================================================================
// Agent Routes (Placeholder)
// =============================================================================

app.get('/api/agents', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'mrf', name: 'Mr.F', tier: 0, role: 'CEO', status: 'active' },
      { id: 'genius', name: 'Dr. Genius', tier: 1, role: 'CIO', status: 'active' },
      { id: 'quantum', name: 'Quantum', tier: 1, role: 'CTO', status: 'active' },
      { id: 'oracle', name: 'Oracle', tier: 1, role: 'CDO', status: 'active' },
      { id: 'sentinel', name: 'Sentinel', tier: 1, role: 'CSO', status: 'active' },
      { id: 'architect', name: 'Architect', tier: 1, role: 'CAO', status: 'idle' },
      { id: 'catalyst', name: 'Catalyst', tier: 1, role: 'CGO', status: 'active' },
    ],
    total: 31,
  });
});

app.get('/api/agents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id,
      name: `Agent ${id}`,
      status: 'active',
      tier: 1,
      lastActive: new Date().toISOString(),
      metrics: {
        tasksCompleted: Math.floor(Math.random() * 100),
        avgResponseTime: Math.random() * 100 + 50,
        successRate: 95 + Math.random() * 5,
      },
    },
  });
});

// =============================================================================
// Project Routes (Placeholder)
// =============================================================================

app.get('/api/projects', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'p1', name: 'ARC Platform', status: 'active', progress: 95 },
      { id: 'p2', name: 'XBook Engine', status: 'active', progress: 60 },
      { id: 'p3', name: 'BioSentinel', status: 'active', progress: 80 },
    ],
    total: 3,
  });
});

// =============================================================================
// Socket.IO Events
// =============================================================================

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send initial status
  socket.emit('system:status', {
    connected: true,
    timestamp: new Date().toISOString(),
  });

  // Simulate agent activity
  const activityInterval = setInterval(() => {
    socket.emit('agent:activity', {
      agentId: ['mrf', 'genius', 'quantum', 'oracle'][Math.floor(Math.random() * 4)],
      action: ['processing', 'completed', 'idle'][Math.floor(Math.random() * 3)],
      timestamp: new Date().toISOString(),
    });
  }, 5000);

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    clearInterval(activityInterval);
  });
});

// =============================================================================
// Error Handling
// =============================================================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// =============================================================================
// Start Server
// =============================================================================

httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 MRF103 ARC Ecosystem Server                        ║
║                                                          ║
║   Environment: ${NODE_ENV.padEnd(40)}║
║   Port: ${String(PORT).padEnd(47)}║
║   Time: ${new Date().toISOString().padEnd(43)}║
║                                                          ║
║   Status: ONLINE ✅                                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export { app, io };
