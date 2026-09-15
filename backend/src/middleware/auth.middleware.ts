import prisma from '../config/database';
import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';

// Extend Express User type
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Authentication token not provided',
        },
      });
    }

    // Verify token
    const payload = authService.verifyAccessToken(token);

    // Attach user to request
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true, role: true } });
      if (!user) throw new Error('User no longer exists');
      req.user = user;

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: error.message || 'Invalid or expired token',
      },
    });
  }
};

export const authenticateOptional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const payload = authService.verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true, role: true } });
      if (!user) throw new Error('User no longer exists');
      req.user = user;
    }
  } catch (error) {
    // Ignore verification errors for optional auth
  }
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const payload = authService.verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true, role: true } });
      if (!user) throw new Error('User no longer exists');
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
