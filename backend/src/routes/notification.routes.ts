import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.get('/', authenticate, notificationController.getNotifications);
router.patch('/mark-all-read', authenticate, notificationController.markAllAsRead);
router.patch('/:id/mark-read', authenticate, notificationController.markAsRead);

router.get('/settings', authenticate, notificationController.getSettings);
router.put('/settings', authenticate, notificationController.updateSettings);

export default router;
