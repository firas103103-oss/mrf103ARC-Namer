import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Just pass through, don't require auth
  next();
}
