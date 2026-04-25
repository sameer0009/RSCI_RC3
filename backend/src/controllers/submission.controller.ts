import { Request, Response } from 'express';
import submissionService from '../services/submission.service';

export class SubmissionController {
  submitCode = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const { problemId, sourceCode: code, languageId: language, contestId } = req.body;

      if (!problemId || !code || !language) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Problem ID, sourceCode, and languageId are required',
          },
        });
      }

      const submission = await submissionService.createSubmission({
        userId,
        problemId,
        code,
        language,
        contestId,
      });

      res.status(201).json({
        success: true,
        data: { submission },
        message: 'Code submitted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SUBMISSION_FAILED',
          message: error.message || 'Failed to submit code',
        },
      });
    }
  };

  runCode = async (req: Request, res: Response) => {
    try {
      const { sourceCode: code, languageId: language, stdin } = req.body;

      if (!code || !language) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'sourceCode and languageId are required',
          },
        });
      }

      const result = await submissionService.runCode(code, language, stdin || '');

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          message: error.message || 'Code execution failed',
        },
      });
    }
  };

  runSampleTests = async (req: Request, res: Response) => {
    try {
      const { problemId, sourceCode: code, languageId: language } = req.body;

      if (!problemId || !code || !language) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Problem ID, sourceCode, and languageId are required',
          },
        });
      }

      const results = await submissionService.runSampleTests(problemId, code, language);

      res.json({
        success: true,
        data: { results },
        message: 'Sample tests executed successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SAMPLE_TEST_FAILED',
          message: error.message || 'Failed to run sample tests',
        },
      });
    }
  };

  getSubmission = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const submission = await submissionService.getSubmission(id);

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SUBMISSION_NOT_FOUND',
            message: 'Submission not found',
          },
        });
      }

      res.json({
        success: true,
        data: { submission },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_SUBMISSION_FAILED',
          message: error.message || 'Failed to fetch submission',
        },
      });
    }
  };

  getUserSubmissions = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const result = await submissionService.getUserSubmissions(
        userId,
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
          code: 'GET_SUBMISSIONS_FAILED',
          message: error.message || 'Failed to fetch submissions',
        },
      });
    }
  };

  getUserSubmissionsForProblem = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      }
      const { problemId } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const result = await submissionService.getUserSubmissionsForProblem(
        userId,
        problemId,
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
          code: 'GET_SUBMISSIONS_FAILED',
          message: error.message || 'Failed to fetch submissions',
        },
      });
    }
  };
}

export default new SubmissionController();
