import { Router } from 'express';
import authRoutes from './auth.routes';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';
import leaderboardRoutes from './leaderboard.routes';
import analyticsRoutes from './analytics.routes';
import profileRoutes from './profile.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';
import classroomRoutes from './classroom.routes';
import contestRoutes from './contest.routes';
import solutionRoutes from './solution.routes';
import commentRoutes from './comment.routes';
import voteRoutes from './vote.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', profileRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/contests', contestRoutes);
router.use('/solutions', solutionRoutes);
router.use('/comments', commentRoutes);
router.use('/votes', voteRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
