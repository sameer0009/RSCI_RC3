import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Admin and Manager routes
router.get('/dashboard', authenticate, authorize('ADMIN', 'CONTEST_MANAGER'), analyticsController.getDashboardStats);

router.get('/activity', authenticate, authorize('ADMIN', 'CONTEST_MANAGER'), analyticsController.getUserActivity);

router.get(
  '/submissions-trend',
  authenticate,
  authorize('ADMIN', 'CONTEST_MANAGER'),
  analyticsController.getSubmissionTrend
);

router.get(
  '/difficulty-dist',
  authenticate,
  authorize('ADMIN', 'CONTEST_MANAGER'),
  analyticsController.getDifficultyDistribution
);

router.get(
  '/language-stats',
  authenticate,
  authorize('ADMIN', 'CONTEST_MANAGER'),
  analyticsController.getLanguageStats
);

router.get('/active-users', authenticate, authorize('ADMIN', 'CONTEST_MANAGER'), analyticsController.getActiveUsers);

router.get('/export', authenticate, authorize('ADMIN'), analyticsController.exportAnalytics);

export default router;
