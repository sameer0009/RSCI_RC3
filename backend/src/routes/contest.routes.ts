import { Router } from 'express';
import contestController from '../controllers/contest.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', contestController.getContests);
router.get('/:id', authenticate, contestController.getContest);
router.get('/:id/leaderboard', contestController.getContestLeaderboard);
router.get('/:id/problems', authenticate, contestController.getContestProblems);

// Protected routes
router.post('/:id/register', authenticate, contestController.registerContest);
router.post('/:id/virtual', authenticate, contestController.startVirtualContest);

// Management routes
router.post('/', authenticate, authorize(Role.ADMIN, Role.CONTEST_MANAGER), contestController.createContest);
router.put('/:id', authenticate, authorize(Role.ADMIN, Role.CONTEST_MANAGER), contestController.updateContest);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.CONTEST_MANAGER), contestController.deleteContest);

export default router;
