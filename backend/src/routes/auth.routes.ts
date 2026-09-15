import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import passport from 'passport';
import authController from '../controllers/auth.controller';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, error: { message: 'Too many attempts. Please try again in 15 minutes.' } } });
router.use(['/login', '/forgot-password', '/reset-password'], loginLimiter);
const oauthStart = (provider: string, scope: string[]) => (req: any, res: any, next: any) => {
  const state = crypto.randomBytes(32).toString('hex');
  res.cookie('oauthState', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 10 * 60 * 1000, path: '/api/auth' });
  passport.authenticate(provider, { scope, state, session: false })(req, res, next);
};
const oauthState = (req: any, res: any, next: any) => {
  const expected = req.cookies?.oauthState;
  res.clearCookie('oauthState', { path: '/api/auth' });
  if (typeof expected !== 'string' || typeof req.query.state !== 'string' || expected.length !== req.query.state.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(req.query.state))) return res.status(403).json({ success: false, error: { message: 'Invalid OAuth state' } });
  next();
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', (req, res) => {
  res.status(403).json({
    success: false,
    error: {
      code: 'REGISTRATION_DISABLED',
      message: 'Public registration is disabled. Please contact an admin for an account.',
    },
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, validate, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Reset email sent
 */
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// OAuth Routes
router.get('/google', oauthStart('google', ['profile', 'email']));
router.get(
  '/google/callback',
  oauthState,
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`, session: false }),
  authController.oauthCallback
);

router.get('/github', oauthStart('github', ['user:email']));
router.get(
  '/github/callback',
  oauthState,
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`, session: false }),
  authController.oauthCallback
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, authController.getMe);

export default router;
