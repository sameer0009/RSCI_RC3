import { fields, problemFields } from '../middleware/input.middleware';
import { ownsResource, contestVisibility, problemSelection } from '../middleware/access.middleware';
import { Router } from 'express';
import contestController from '../controllers/contest.controller';
import { authenticate, authenticateOptional, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', authenticateOptional, contestController.getContests);
router.get('/:id', authenticate, contestController.getContest);
router.get('/:id/leaderboard', authenticateOptional, contestVisibility, contestController.getContestLeaderboard);
router.get('/:id/problems', authenticate, contestController.getContestProblems);

// Protected routes
router.post('/:id/register', authenticate, contestController.registerContest);
router.post('/:id/virtual', authenticate, (_req, res) => { res.status(501).json({ success: false, error: { code: 'VIRTUAL_UNAVAILABLE', message: 'Virtual contests are not available yet. Practice published problems instead.' } }); });

// Management routes
router.post('/', authenticate, authorize(Role.ADMIN, Role.CONTEST_MANAGER), fields(['title','description','startTime','endTime','duration','frozenDuration','isPublic','password','problemIds','createdBy']), problemSelection, contestController.createContest);
router.put('/:id', authenticate, authorize(Role.ADMIN, Role.CONTEST_MANAGER), ownsResource('contest'), fields(['title','description','startTime','endTime','duration','frozenDuration','isPublic','password','problemIds','createdBy']), problemSelection, contestController.updateContest);
router.delete('/:id', authenticate, authorize(Role.ADMIN, Role.CONTEST_MANAGER), ownsResource('contest'), contestController.deleteContest);
router.post('/:id/bulk-register', authenticate, authorize(Role.ADMIN, Role.CONTEST_MANAGER), ownsResource('contest'), contestController.bulkRegister);

export default router;
