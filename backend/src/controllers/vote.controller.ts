import { Request, Response } from 'express';
import voteService from '../services/vote.service';

export class VoteController {
  toggleVote = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      
      const { solutionId, value } = req.body;
      if (value !== 1 && value !== -1) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'value must be 1 or -1' } });
      }

      const result = await voteService.toggleVote(userId, solutionId, value);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'VOTE_FAILED', message: error.message } });
    }
  };
}

export default new VoteController();
