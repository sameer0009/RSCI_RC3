import { Request, Response } from 'express';
import adminService from '../services/admin.service';

class AdminController {
  // ============ PROBLEM MANAGEMENT ============

  /**
   * Create problem
   * POST /api/admin/problems
   */
  createProblem = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const problem = await adminService.createProblem({
        ...req.body,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: problem,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_PROBLEM_FAILED',
          message: error.message || 'Failed to create problem',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * List problems
   * GET /api/admin/problems
   */
  listProblems = async (req: Request, res: Response) => {
    try {
      const { page, limit, difficulty, search } = req.query;
      const result = await adminService.listProblems({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        difficulty: difficulty as any,
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LIST_PROBLEMS_FAILED',
          message: error.message || 'Failed to list problems',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Get problem details
   * GET /api/admin/problems/:id
   */
  getProblem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const problem = await adminService.listProblems({ search: id });

      res.json({
        success: true,
        data: problem,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROBLEM_NOT_FOUND',
          message: error.message || 'Problem not found',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Update problem
   * PUT /api/admin/problems/:id
   */
  updateProblem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const problem = await adminService.updateProblem(id, req.body);

      res.json({
        success: true,
        data: problem,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_PROBLEM_FAILED',
          message: error.message || 'Failed to update problem',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Delete problem
   * DELETE /api/admin/problems/:id
   */
  deleteProblem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await adminService.deleteProblem(id);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_PROBLEM_FAILED',
          message: error.message || 'Failed to delete problem',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Bulk upload test cases
   * POST /api/admin/problems/:id/testcases/bulk
   */
  bulkUploadTestCases = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { testCases } = req.body;

      if (!Array.isArray(testCases)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'testCases must be an array',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await adminService.bulkUploadTestCases(id, testCases);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BULK_UPLOAD_FAILED',
          message: error.message || 'Failed to upload test cases',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  // ============ USER MANAGEMENT ============

  /**
   * List users
   * GET /api/admin/users
   */
  listUsers = async (req: Request, res: Response) => {
    try {
      const { page, limit, role, search } = req.query;
      const result = await adminService.listUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        role: role as any,
        search: search as string,
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LIST_USERS_FAILED',
          message: error.message || 'Failed to list users',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Get user details
   * GET /api/admin/users/:id
   */
  getUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Use search to find by ID
      const result = await adminService.listUsers({ search: id, limit: 1 });

      if (result.users.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        data: result.users[0],
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: error.message || 'User not found',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Update user
   * PUT /api/admin/users/:id
   */
  updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await adminService.updateUser(id, req.body);

      res.json({
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_USER_FAILED',
          message: error.message || 'Failed to update user',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Delete user
   * DELETE /api/admin/users/:id
   */
  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await adminService.deleteUser(id);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_USER_FAILED',
          message: error.message || 'Failed to delete user',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Search users
   * GET /api/admin/users/search
   */
  searchUsers = async (req: Request, res: Response) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: 'Search query is required',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const users = await adminService.searchUsers(q as string);

      res.json({
        success: true,
        data: users,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: error.message || 'Failed to search users',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
}

export default new AdminController();
