import { Request, Response } from 'express';
import contestService from '../services/contest.service';

export class ContestController {
  getContests = async (req: Request, res: Response) => {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const status = req.query.status as string;

      const result = await contestService.getContests(page, limit, status);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_CONTESTS_FAILED',
          message: error.message || 'Failed to fetch contests',
        },
      });
    }
  };

  getContest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const contest = await contestService.getContest(id);

      if (!contest) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONTEST_NOT_FOUND',
            message: 'Contest not found',
          },
        });
      }

      // Hide problems if not active or ended, unless user is admin
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin && contest.status === 'Upcoming') {
        contest.problems = [];
      }

      res.json({
        success: true,
        data: { contest },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_CONTEST_FAILED',
          message: error.message || 'Failed to fetch contest',
        },
      });
    }
  };

  registerContest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const participant = await contestService.registerUser(id, userId, password);

      res.status(201).json({
        success: true,
        data: { participant },
        message: 'Successfully registered for the contest',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message || 'Failed to register',
        },
      });
    }
  };

  getContestLeaderboard = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const leaderboard = await contestService.getLeaderboard(id);

      res.json({
        success: true,
        data: { leaderboard },
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

  getContestProblems = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const isAdmin = req.user?.role === 'ADMIN';
      const problems = await contestService.getContestProblems(id, userId, isAdmin);

      res.json({
        success: true,
        data: { problems },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'GET_PROBLEMS_FAILED',
          message: error.message || 'Failed to fetch problems',
        },
      });
    }
  };

  startVirtualContest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const virtualMetadata = await contestService.startVirtualContest(id, userId);

      res.json({
        success: true,
        data: { virtualContest: virtualMetadata },
        message: 'Virtual contest started successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VIRTUAL_START_FAILED',
          message: error.message || 'Failed to start virtual contest',
        },
      });
    }
  };

  createContest = async (req: Request, res: Response) => {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?.id
      };
      const contest = await contestService.createContest(payload);
      res.status(201).json({ success: true, data: { contest } });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'CREATE_CONTEST_FAILED', message: error.message },
      });
    }
  };

  updateContest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const contest = await contestService.updateContest(id, req.body);
      res.json({ success: true, data: { contest } });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'UPDATE_CONTEST_FAILED', message: error.message },
      });
    }
  };

  deleteContest = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await contestService.deleteContest(id);
      res.json({ success: true, message: 'Contest deleted successfully' });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'DELETE_CONTEST_FAILED', message: error.message },
      });
    }
  };
}

export default new ContestController();
