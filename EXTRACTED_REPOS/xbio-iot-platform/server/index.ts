import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { bioSentinelRouter } from './routes/bio-sentinel';
import logger from './utils/logger';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/bio-sentinel' });

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/bio-sentinel', bioSentinelRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  logger.info('WebSocket client connected');

  ws.on('message', (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      logger.debug('WebSocket message received', data);

      // Handle different command types
      switch (data.type) {
        case 'set_mode':
          logger.info(`Setting mode to: ${data.payload?.mode}`);
          ws.send(JSON.stringify({
            type: 'command_ack',
            payload: {
              command: 'set_mode',
              status: 'received',
            },
          }));
          break;

        case 'start_calibration':
          logger.info('Starting calibration');
          ws.send(JSON.stringify({
            type: 'command_ack',
            payload: {
              command: 'start_calibration',
              status: 'received',
            },
          }));
          // Simulate calibration completion after 5 seconds
          setTimeout(() => {
            ws.send(JSON.stringify({
              type: 'calibration_complete',
              payload: {
                success: true,
                baseline_gas: 150000,
              },
              timestamp: Date.now(),
            }));
          }, 5000);
          break;

        case 'start_capture':
          logger.info('Starting capture');
          const captureId = data.payload?.capture_id;
          ws.send(JSON.stringify({
            type: 'command_ack',
            payload: {
              command: 'start_capture',
              status: 'received',
            },
          }));
          // Simulate capture completion
          setTimeout(() => {
            ws.send(JSON.stringify({
              type: 'capture_complete',
              payload: {
                capture_id: captureId,
                samples_count: 30,
                success: true,
              },
              timestamp: Date.now(),
            }));
          }, 30000);
          break;

        case 'stop':
          logger.info('Stopping capture');
          ws.send(JSON.stringify({
            type: 'command_ack',
            payload: {
              command: 'stop',
              status: 'received',
            },
          }));
          break;

        default:
          logger.warn('Unknown command type', data.type);
      }
    } catch (error) {
      logger.error('Error parsing WebSocket message', error);
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error', error);
  });

  // Send initial device status
  ws.send(JSON.stringify({
    type: 'device_status',
    payload: {
      mode: 'idle',
      uptime_ms: Date.now(),
      wifi_rssi: -45,
      free_heap: 102400,
      heater_profile: 'balanced',
      firmware_version: '1.0.0',
      last_calibration: null,
      errors: [],
    },
    timestamp: Date.now(),
  }));

  // Simulate periodic sensor readings
  const readingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'sensor_reading',
        payload: {
          gas_resistance: 150000 + Math.random() * 50000,
          temperature: 22 + Math.random() * 3,
          humidity: 45 + Math.random() * 10,
          pressure: 1013,
          iaq_score: 50 + Math.random() * 20,
          iaq_accuracy: 3,
          co2_equivalent: 400 + Math.random() * 100,
          voc_equivalent: 0.5 + Math.random() * 0.5,
          heater_temp: 320,
          heater_duration: 150,
          mode: 'monitoring',
        },
        timestamp: Date.now(),
      }));
    }
  }, 2000);

  ws.on('close', () => {
    clearInterval(readingInterval);
  });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`XBio Server running on port ${PORT}`);
  logger.info(`WebSocket endpoint: ws://localhost:${PORT}/ws/bio-sentinel`);
  logger.info(`API endpoint: http://localhost:${PORT}/api/bio-sentinel`);
});
