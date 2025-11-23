import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import problemService from '../services/problem.service';

export class ProblemController {
  async createProblem(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const problem = await problemService.createProblem({
        ...req.body,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: { problem },
        message: 'Problem created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_PROBLEM_FAILED',
          message: error.message || 'Failed to create problem',
        },
      });
    }
  }

  async getProblems(req: Request, res: Response) {
    try {
      const {
        difficulty,
        topics,
        search,
        page = '1',
        limit = '20',
      } = req.query;

      const filters: any = {};

      if (difficulty) {
        filters.difficulty = difficulty;
      }

      if (topics) {
        filters.topics = Array.isArray(topics) ? topics : [topics];
      }

      if (search) {
        filters.search = search as string;
      }

      if (req.user?.userId) {
        filters.userId = req.user.userId;
      }

      const result = await problemService.getProblems(
        filters,
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
          code: 'GET_PROBLEMS_FAILED',
          message: error.message || 'Failed to fetch problems',
        },
      });
    }
  }

  async getProblemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';

      const problem = await problemService.getProblemById(id, isAdmin);

      if (!problem) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROBLEM_NOT_FOUND',
            message: 'Problem not found',
          },
        });
      }

      res.json({
        success: true,
        data: { problem },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PROBLEM_FAILED',
          message: error.message || 'Failed to fetch problem',
        },
      });
    }
  }

  async getProblemBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';

      const problem = await problemService.getProblemBySlug(slug, isAdmin);

      if (!problem) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROBLEM_NOT_FOUND',
            message: 'Problem not found',
          },
        });
      }

      res.json({
        success: true,
        data: { problem },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PROBLEM_FAILED',
          message: error.message || 'Failed to fetch problem',
        },
      });
    }
  }

  async updateProblem(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { id } = req.params;

      const problem = await problemService.updateProblem(id, req.body);

      res.json({
        success: true,
        data: { problem },
        message: 'Problem updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_PROBLEM_FAILED',
          message: error.message || 'Failed to update problem',
        },
      });
    }
  }

  async deleteProblem(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await problemService.deleteProblem(id);

      res.json({
        success: true,
        message: 'Problem deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_PROBLEM_FAILED',
          message: error.message || 'Failed to delete problem',
        },
      });
    }
  }

  async getTopics(req: Request, res: Response) {
    try {
      const topics = await problemService.getAllTopics();

      res.json({
        success: true,
        data: { topics },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_TOPICS_FAILED',
          message: error.message || 'Failed to fetch topics',
        },
      });
    }
  }

  async getTestCaseGroups(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const groups = await problemService.getTestCaseGroups(id);

      res.json({
        success: true,
        data: { groups },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_GROUPS_FAILED',
          message: error.message || 'Failed to fetch test case groups',
        },
      });
    }
  }

  async createTestCaseGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const group = await problemService.createTestCaseGroup(id, req.body);

      res.status(201).json({
        success: true,
        data: { group },
        message: 'Test case group created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_GROUP_FAILED',
          message: error.message || 'Failed to create test case group',
        },
      });
    }
  }

  async updateTestCaseGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const group = await problemService.updateTestCaseGroup(groupId, req.body);

      res.json({
        success: true,
        data: { group },
        message: 'Test case group updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_GROUP_FAILED',
          message: error.message || 'Failed to update test case group',
        },
      });
    }
  }

  async deleteTestCaseGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      await problemService.deleteTestCaseGroup(groupId);

      res.json({
        success: true,
        message: 'Test case group deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_GROUP_FAILED',
          message: error.message || 'Failed to delete test case group',
        },
      });
    }
  }
}

export default new ProblemController();
