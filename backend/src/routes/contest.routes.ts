import { Router } from 'express';
import contestController from '../controllers/contest.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (or partially public, handled in controller)
router.get('/', contestController.getContests);
router.get('/:id', authenticate, contestController.getContest);
router.get('/:id/leaderboard', contestController.getContestLeaderboard);
router.get('/:id/problems', authenticate, contestController.getContestProblems);

// Protected routes
router.post('/:id/register', authenticate, contestController.registerContest);
router.post('/:id/virtual', authenticate, contestController.startVirtualContest);

// Admin routes can be added if needed, like POST /contests for creation, but prompt only mentioned the above.

export default router;
