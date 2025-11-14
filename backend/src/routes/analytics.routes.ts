import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Admin only routes
router.get(
  '/dashboard',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getDashboardStats
);

router.get(
  '/activity',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getUserActivity
);

router.get(
  '/submissions-trend',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getSubmissionTrend
);

router.get(
  '/difficulty-dist',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getDifficultyDistribution
);

router.get(
  '/language-stats',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getLanguageStats
);

router.get(
  '/active-users',
  authenticate,
  authorize('ADMIN'),
  analyticsController.getActiveUsers
);

router.get(
  '/export',
  authenticate,
  authorize('ADMIN'),
  analyticsController.exportAnalytics
);

export default router;
