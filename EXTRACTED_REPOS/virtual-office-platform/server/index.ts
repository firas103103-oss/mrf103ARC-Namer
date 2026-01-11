import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import cloningRoutes from './routes/cloning';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const PgSession = pgSession(session);

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Session management
app.use(session({
  store: new PgSession({
    pool,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax'
  }
}));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/cloning', cloningRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Virtual Office Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      cloning: '/api/cloning',
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Virtual Office Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check at http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
