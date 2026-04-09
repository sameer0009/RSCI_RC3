import { Router } from 'express';
import passport from 'passport';
import authController from '../controllers/auth.controller';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Verification and Password Reset
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), authController.oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login', session: false }), authController.oauthCallback);

// Protected routes
router.get('/me', authenticate, authController.getMe);

export default router;
