import { Request, Response, NextFunction } from 'express';

/**
 * Simple CSRF protection by validating Origin/Referer headers
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip for non-mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  const referer = req.get('referer');
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

  // In production, we should be stricter
  if (process.env.NODE_ENV === 'production') {
    if (!origin || !origin.startsWith(allowedOrigin)) {
      if (!referer || !referer.startsWith(allowedOrigin)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CSRF_ERROR',
            message: 'Invalid request origin',
          },
        });
      }
    }
  }

  next();
};
