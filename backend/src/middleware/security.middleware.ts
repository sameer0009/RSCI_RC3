import { Request, Response, NextFunction } from 'express';

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  const referer = req.get('referer');
  // Requests without ambient cookies may use explicit bearer authentication.
  if (!origin && !referer && !req.cookies?.accessToken && !req.cookies?.refreshToken) return next();
  try {
    const allowed = new URL(process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000').origin;
    const source = origin || referer;
    if (source && new URL(source).origin === allowed) return next();
  } catch { /* Invalid origins fail closed. */ }
  return res.status(403).json({ success: false, error: { code: 'CSRF_ERROR', message: 'Invalid request origin' } });
};
