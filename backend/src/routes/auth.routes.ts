import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.getMe);

export default router;
