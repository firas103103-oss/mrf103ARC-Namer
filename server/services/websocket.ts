/**
 * 🔌 Socket.IO Real-time Communication
 * Enterprise WebSocket management for Stellar Command OS
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import logger, { logSecurityEvent, logAudit } from '../utils/logger';
import { verifyAccessToken } from '../middleware/auth';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private connectedClients: Map<string, AuthenticatedSocket> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.VITE_API_URL || 'http://localhost:5173',
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  /**
   * Authentication middleware
   */
  private setupMiddleware() {
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || 
                     socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          logSecurityEvent('WEBSOCKET_AUTH_MISSING', {
            socketId: socket.id,
            ip: socket.handshake.address
          }, 'medium');
          
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const payload = verifyAccessToken(token);
        
        socket.userId = payload.userId;
        socket.userEmail = payload.email;
        socket.userRole = payload.role;

        logAudit('WEBSOCKET_CONNECTED', payload.email, 'websocket', {
          socketId: socket.id,
          ip: socket.handshake.address
        });

        next();
      } catch (error) {
        logSecurityEvent('WEBSOCKET_AUTH_FAILED', {
          socketId: socket.id,
          ip: socket.handshake.address,
          error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
        }, 'high');
        
        next(new Error('Invalid authentication token'));
      }
    });
  }

  /**
   * Connection event handlers
   */
  private setupConnectionHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info('WebSocket client connected', {
        socketId: socket.id,
        userId: socket.userId,
        userEmail: socket.userEmail
      });

      // Store connected client
      if (socket.userId) {
        this.connectedClients.set(socket.userId, socket);
      }

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info('WebSocket client disconnected', {
          socketId: socket.id,
          userId: socket.userId,
          reason
        });

        if (socket.userId) {
          this.connectedClients.delete(socket.userId);
        }

        logAudit('WEBSOCKET_DISCONNECTED', socket.userEmail || 'unknown', 'websocket', {
          socketId: socket.id,
          reason
        });
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error('WebSocket error', {
          socketId: socket.id,
          userId: socket.userId,
          error: (error instanceof Error ? error.message : 'Unknown error')
        });
      });

      // Join user's personal room
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }

      // Join role-based rooms
      if (socket.userRole) {
        socket.join(`role:${socket.userRole}`);
      }

      // Handle custom events
      this.setupEventHandlers(socket);
    });
  }

  /**
   * Setup custom event handlers
   */
  private setupEventHandlers(socket: AuthenticatedSocket) {
    // Join specific room
    socket.on('join:room', (roomId: string) => {
      socket.join(roomId);
      logger.debug('Socket joined room', {
        socketId: socket.id,
        userId: socket.userId,
        roomId
      });
      
      socket.emit('room:joined', { roomId });
    });

    // Leave specific room
    socket.on('leave:room', (roomId: string) => {
      socket.leave(roomId);
      logger.debug('Socket left room', {
        socketId: socket.id,
        userId: socket.userId,
        roomId
      });
      
      socket.emit('room:left', { roomId });
    });

    // Typing indicator
    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit('user:typing', {
        userId: socket.userId,
        conversationId: data.conversationId
      });
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit('user:stopped-typing', {
        userId: socket.userId,
        conversationId: data.conversationId
      });
    });

    // Presence updates
    socket.on('presence:update', (status: 'online' | 'away' | 'busy') => {
      if (socket.userId) {
        this.broadcastToRoom(`user:${socket.userId}`, 'presence:changed', {
          userId: socket.userId,
          status,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emit event to specific role
   */
  emitToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  /**
   * Emit event to specific room
   */
  emitToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  /**
   * Broadcast to room except sender
   */
  broadcastToRoom(roomId: string, event: string, data: any, exceptSocketId?: string) {
    if (exceptSocketId) {
      this.io.to(roomId).except(exceptSocketId).emit(event, data);
    } else {
      this.io.to(roomId).emit(event, data);
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUserIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.connectedClients.has(userId);
  }

  /**
   * Get socket for user
   */
  getUserSocket(userId: string): AuthenticatedSocket | undefined {
    return this.connectedClients.get(userId);
  }

  /**
   * Disconnect user
   */
  disconnectUser(userId: string, reason?: string) {
    const socket = this.connectedClients.get(userId);
    if (socket) {
      socket.disconnect(true);
      logAudit('WEBSOCKET_FORCED_DISCONNECT', socket.userEmail || 'unknown', 'websocket', {
        userId,
        reason
      });
    }
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let webSocketManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  if (!webSocketManager) {
    webSocketManager = new WebSocketManager(httpServer);
    logger.info('✅ WebSocket server initialized');
  }
  return webSocketManager;
}

export function getWebSocketManager(): WebSocketManager {
  if (!webSocketManager) {
    throw new Error('WebSocket manager not initialized');
  }
  return webSocketManager;
}

// Event types for type safety
export enum WebSocketEvent {
  // Connection events
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  
  // Message events
  MESSAGE_NEW = 'message:new',
  MESSAGE_UPDATED = 'message:updated',
  MESSAGE_DELETED = 'message:deleted',
  
  // Typing events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
  USER_TYPING = 'user:typing',
  USER_STOPPED_TYPING = 'user:stopped-typing',
  
  // Presence events
  PRESENCE_UPDATE = 'presence:update',
  PRESENCE_CHANGED = 'presence:changed',
  
  // Room events
  ROOM_JOINED = 'room:joined',
  ROOM_LEFT = 'room:left',
  ROOM_UPDATED = 'room:updated',
  
  // Notification events
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
  
  // System events
  SYSTEM_ANNOUNCEMENT = 'system:announcement',
  SYSTEM_MAINTENANCE = 'system:maintenance',
  
  // Agent events
  AGENT_STATUS_CHANGED = 'agent:status-changed',
  AGENT_TASK_COMPLETED = 'agent:task-completed',
  AGENT_ERROR = 'agent:error',
  
  // Task events
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_ASSIGNED = 'task:assigned',
  TASK_COMPLETED = 'task:completed'
}

export default {
  initializeWebSocket,
  getWebSocketManager,
  WebSocketEvent
};