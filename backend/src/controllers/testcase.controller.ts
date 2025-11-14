import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import testCaseService from '../services/testcase.service';
import problemService from '../services/problem.service';

export class TestCaseController {
  async uploadTestCases(req: Request, res: Response) {
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

      const { id: problemId } = req.params;
      const { testCases } = req.body;

      // Verify problem exists
      const problem = await problemService.getProblemById(problemId, true);
      if (!problem) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROBLEM_NOT_FOUND',
            message: 'Problem not found',
          },
        });
      }

      // Add problemId to each test case
      const testCasesWithProblemId = testCases.map((tc: any, index: number) => ({
        ...tc,
        problemId,
        orderIndex: tc.orderIndex !== undefined ? tc.orderIndex : index + 1,
      }));

      const createdTestCases = await testCaseService.createMultipleTestCases(
        testCasesWithProblemId
      );

      res.status(201).json({
        success: true,
        data: { testCases: createdTestCases },
        message: 'Test cases uploaded successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_TESTCASES_FAILED',
          message: error.message || 'Failed to upload test cases',
        },
      });
    }
  }

  async getTestCases(req: Request, res: Response) {
    try {
      const { id: problemId } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';

      const testCases = await testCaseService.getTestCasesByProblemId(problemId, isAdmin);

      res.json({
        success: true,
        data: { testCases },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_TESTCASES_FAILED',
          message: error.message || 'Failed to fetch test cases',
        },
      });
    }
  }

  async updateTestCase(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const testCase = await testCaseService.updateTestCase(id, req.body);

      res.json({
        success: true,
        data: { testCase },
        message: 'Test case updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_TESTCASE_FAILED',
          message: error.message || 'Failed to update test case',
        },
      });
    }
  }

  async deleteTestCase(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await testCaseService.deleteTestCase(id);

      res.json({
        success: true,
        message: 'Test case deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_TESTCASE_FAILED',
          message: error.message || 'Failed to delete test case',
        },
      });
    }
  }
}

export default new TestCaseController();
