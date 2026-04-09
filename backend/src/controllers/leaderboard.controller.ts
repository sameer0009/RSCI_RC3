import { Request, Response } from 'express';
import leaderboardService from '../services/leaderboard.service';

export class LeaderboardController {
  getGlobalLeaderboard = async (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '50' } = req.query;

      const result = await leaderboardService.getGlobalLeaderboard(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_LEADERBOARD_FAILED',
          message: error.message || 'Failed to fetch leaderboard',
        },
      });
    }
  };

  getUserRank = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const result = await leaderboardService.getUserRank(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_RANK_FAILED',
          message: error.message || 'Failed to fetch user rank',
        },
      });
    }
  };
}

export default new LeaderboardController();
