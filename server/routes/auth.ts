/**
 * 🔐 Authentication Routes
 * JWT-based authentication endpoints for Stellar Command OS
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import auth, { generateTokens, hashPassword, comparePassword, blacklistToken, refreshTokens } from '../middleware/auth';
import { asyncHandler, ValidationError, AuthenticationError, AppError } from '../middleware/error-handler';
import { ErrorCategory, logAudit, logSecurityEvent } from '../utils/logger';

const router = Router();

// Mock user database (replace with real database)
interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

const mockUsers: User[] = [
  {
    id: 'admin-001',
    email: 'admin@stellar-command.com',
    password: '$2b$12$yWnwA8MgXo2Uo8iUG7noTuOsDScT4WRqGQ2LIa1a4OuCCYmqLOTdi', // mrfiras1Q@@
    role: auth.ROLES.ADMIN,
    permissions: [auth.PERMISSIONS.ALL],
    createdAt: new Date(),
    isActive: true
  },
  {
    id: 'operator-001',
    email: 'operator@stellar-command.com',
    password: '$2b$12$yWnwA8MgXo2Uo8iUG7noTuOsDScT4WRqGQ2LIa1a4OuCCYmqLOTdi', // mrfiras1Q@@
    role: auth.ROLES.OPERATOR,
    permissions: [auth.PERMISSIONS.READ_SYSTEM, auth.PERMISSIONS.EXECUTE_COMMANDS],
    createdAt: new Date(),
    isActive: true
  }
];

// User registration
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('role')
    .optional()
    .isIn(Object.values(auth.ROLES))
    .withMessage('Invalid role')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', { errors: errors.array() });
  }

  const { email, password, role = auth.ROLES.USER } = req.body;

  // Check if user already exists
  const existingUser = mockUsers.find(user => user.email === email);
  if (existingUser) {
    logSecurityEvent('DUPLICATE_REGISTRATION_ATTEMPT', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }, 'medium');
    
    throw new AppError('User already exists', 409, ErrorCategory.VALIDATION, 'USER_EXISTS');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    password: hashedPassword,
    role,
    permissions: getDefaultPermissions(role),
    createdAt: new Date(),
    isActive: true
  };

  mockUsers.push(newUser);

  // Generate tokens
  const tokens = generateTokens({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    permissions: newUser.permissions
  });

  logAudit('USER_REGISTERED', newUser.email, 'user_account', {
    userId: newUser.id,
    role: newUser.role,
    ip: req.ip
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      permissions: newUser.permissions,
      createdAt: newUser.createdAt
    },
    tokens
  });
}));

// User login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', { errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user
  const user = mockUsers.find(u => u.email === email && u.isActive);
  if (!user) {
    logSecurityEvent('LOGIN_ATTEMPT_INVALID_EMAIL', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }, 'medium');
    
    throw new AuthenticationError('Invalid credentials');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', {
      email,
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }, 'high');
    
    throw new AuthenticationError('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();

  // Generate tokens
  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  });

  logAudit('USER_LOGIN', user.email, 'authentication', {
    userId: user.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      lastLogin: user.lastLogin
    },
    tokens
  });
}));

// Token refresh
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', { errors: errors.array() });
  }

  const { refreshToken } = req.body;

  try {
    // Decode refresh token to get user ID
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(refreshToken) as any;
    
    if (!decoded || !decoded.userId) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Find user
    const user = mockUsers.find(u => u.id === decoded.userId && u.isActive);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Generate new tokens
    const newTokens = refreshTokens(refreshToken, {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });

    logAudit('TOKEN_REFRESHED', user.email, 'authentication', {
      userId: user.id,
      ip: req.ip
    });

    res.json({
      message: 'Tokens refreshed successfully',
      tokens: newTokens
    });
  } catch (error) {
    logSecurityEvent('INVALID_REFRESH_TOKEN', {
      token: refreshToken.substring(0, 20) + '...',
      ip: req.ip,
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
    }, 'high');
    
    throw new AuthenticationError('Invalid or expired refresh token');
  }
}));

// Logout
router.post('/logout', auth.authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = (req as any).user;

  if (token) {
    blacklistToken(token);
  }

  logAudit('USER_LOGOUT', user.email, 'authentication', {
    userId: user.userId,
    ip: req.ip
  });

  res.json({
    message: 'Logout successful'
  });
}));

// Get current user profile
router.get('/me', auth.authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  // Find full user details
  const fullUser = mockUsers.find(u => u.id === user.userId);
  if (!fullUser) {
    throw new AuthenticationError('User not found');
  }

  res.json({
    user: {
      id: fullUser.id,
      email: fullUser.email,
      role: fullUser.role,
      permissions: fullUser.permissions,
      createdAt: fullUser.createdAt,
      lastLogin: fullUser.lastLogin
    }
  });
}));

// Change password
router.post('/change-password', [
  auth.authenticateToken,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must be at least 8 characters with uppercase, lowercase, number and special character')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', { errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const user = (req as any).user;

  // Find user
  const fullUser = mockUsers.find(u => u.id === user.userId);
  if (!fullUser) {
    throw new AuthenticationError('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, fullUser.password);
  if (!isCurrentPasswordValid) {
    logSecurityEvent('PASSWORD_CHANGE_INVALID_CURRENT', {
      userId: user.userId,
      email: user.email,
      ip: req.ip
    }, 'high');
    
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash new password
  fullUser.password = await hashPassword(newPassword);

  logAudit('PASSWORD_CHANGED', user.email, 'user_account', {
    userId: user.userId,
    ip: req.ip
  });

  res.json({
    message: 'Password changed successfully'
  });
}));

// Helper function to get default permissions based on role
function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case auth.ROLES.ADMIN:
      return [auth.PERMISSIONS.ALL];
    case auth.ROLES.OPERATOR:
      return [
        auth.PERMISSIONS.READ_SYSTEM,
        auth.PERMISSIONS.EXECUTE_COMMANDS,
        auth.PERMISSIONS.VIEW_ANALYTICS
      ];
    case auth.ROLES.MAESTRO:
      return [
        auth.PERMISSIONS.READ_SYSTEM,
        auth.PERMISSIONS.MANAGE_AGENTS,
        auth.PERMISSIONS.VIEW_ANALYTICS
      ];
    case auth.ROLES.AGENT:
      return [
        auth.PERMISSIONS.READ_SYSTEM,
        auth.PERMISSIONS.EXECUTE_COMMANDS
      ];
    case auth.ROLES.USER:
    default:
      return [auth.PERMISSIONS.READ_SYSTEM];
  }
}

export default router;