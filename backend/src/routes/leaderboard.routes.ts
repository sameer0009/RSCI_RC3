import { Router } from 'express';
import leaderboardController from '../controllers/leaderboard.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuth, leaderboardController.getGlobalLeaderboard);
router.get('/user/:userId', optionalAuth, leaderboardController.getUserRank);

export default router;
