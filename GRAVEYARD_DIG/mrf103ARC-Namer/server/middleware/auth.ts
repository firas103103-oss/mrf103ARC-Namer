/**
 * 🔐 JWT Authentication System
 * Enterprise-grade authentication for Stellar Command OS
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Types
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.ARC_BACKEND_SECRET || 'dev-access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.ARC_BACKEND_SECRET + '-refresh' || 'dev-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

// In-memory blacklist for tokens (use Redis in production)
const tokenBlacklist = new Set<string>();

/**
 * 🔑 Token Generation
 */
export const generateTokens = (user: AuthUser) => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'stellar-command',
    audience: 'stellar-command-users'
  });

  const refreshToken = jwt.sign(
    { userId: user.id, tokenType: 'refresh' },
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'stellar-command',
      audience: 'stellar-command-users'
    }
  );

  return { accessToken, refreshToken };
};

/**
 * 🔓 Token Verification
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  if (tokenBlacklist.has(token)) {
    throw new Error('Token has been revoked');
  }

  return jwt.verify(token, JWT_ACCESS_SECRET, {
    issuer: 'stellar-command',
    audience: 'stellar-command-users'
  }) as TokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  if (tokenBlacklist.has(token)) {
    throw new Error('Token has been revoked');
  }

  return jwt.verify(token, JWT_REFRESH_SECRET, {
    issuer: 'stellar-command',
    audience: 'stellar-command-users'
  });
};

/**
 * 🔒 Password Hashing
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * 🚪 Authentication Middleware
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'access_token_required',
      message: 'Access token is required for this endpoint'
    });
  }

  try {
    const payload = verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    logger.warn('Token verification failed:', {
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error',
      ip: req.ip,
      path: req.path
    });

    return res.status(403).json({
      error: 'access_token_invalid',
      message: 'Invalid or expired access token'
    });
  }
};

/**
 * 👑 Role-Based Access Control (RBAC)
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as TokenPayload;

    if (!user) {
      return res.status(401).json({
        error: 'authentication_required',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(user.role)) {
      logger.warn('Insufficient permissions:', {
        userId: user.userId,
        userRole: user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        ip: req.ip
      });

      return res.status(403).json({
        error: 'insufficient_permissions',
        message: 'Insufficient permissions for this operation',
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

/**
 * 🔐 Permission-Based Access Control
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as TokenPayload;

    if (!user) {
      return res.status(401).json({
        error: 'authentication_required',
        message: 'Authentication required'
      });
    }

    if (!user.permissions.includes(permission)) {
      logger.warn('Permission denied:', {
        userId: user.userId,
        userPermissions: user.permissions,
        requiredPermission: permission,
        path: req.path,
        ip: req.ip
      });

      return res.status(403).json({
        error: 'permission_denied',
        message: `Permission '${permission}' required`,
        requiredPermission: permission
      });
    }

    next();
  };
};

/**
 * 🚫 Token Blacklisting
 */
export const blacklistToken = (token: string) => {
  tokenBlacklist.add(token);
  
  // Clean up expired tokens periodically
  if (tokenBlacklist.size > 10000) {
    // In production, implement proper cleanup logic
    logger.warn('Token blacklist size exceeded 10000, clearing old tokens');
  }
};

/**
 * 🔄 Token Refresh
 */
export const refreshTokens = (refreshToken: string, user: AuthUser) => {
  try {
    verifyRefreshToken(refreshToken);
    return generateTokens(user);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * 🏠 Session Fallback Support
 */
export const authenticateSession = (req: Request, res: Response, next: NextFunction) => {
  // Check for JWT first
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }

  // Fallback to session-based auth
  if ((req.session as any)?.operatorAuthenticated) {
    (req as any).user = {
      userId: 'operator',
      email: 'operator@stellar-command.com',
      role: 'admin',
      permissions: ['all']
    };
    return next();
  }

  return res.status(401).json({
    error: 'authentication_required',
    message: 'JWT token or valid session required'
  });
};

// Default roles and permissions
export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  MAESTRO: 'maestro',
  AGENT: 'agent',
  USER: 'user'
} as const;

export const PERMISSIONS = {
  ALL: 'all',
  READ_SYSTEM: 'read:system',
  WRITE_SYSTEM: 'write:system',
  MANAGE_AGENTS: 'manage:agents',
  MANAGE_USERS: 'manage:users',
  VIEW_ANALYTICS: 'view:analytics',
  EXECUTE_COMMANDS: 'execute:commands'
} as const;

export default {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  authenticateToken,
  authenticateSession,
  requireRole,
  requirePermission,
  blacklistToken,
  refreshTokens,
  ROLES,
  PERMISSIONS
};