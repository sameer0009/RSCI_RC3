import { Request, Response } from 'express';
import solutionService from '../services/solution.service';

export class SolutionController {
  createSolution = async (req: Request, res: Response) => {
    try {
      const authorId = req.user?.id;
      if (!authorId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      
      const { problemId, title, content, language } = req.body;
      const solution = await solutionService.createSolution({ problemId, authorId, title, content, language });
      res.status(201).json({ success: true, data: { solution } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
    }
  };

  getSolutions = async (req: Request, res: Response) => {
    try {
      const { problemId } = req.query;
      const { page = '1', limit = '20' } = req.query;
      
      if (!problemId) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'problemId is required' } });

      const result = await solutionService.getSolutionsByProblem(problemId as string, parseInt(page as string), parseInt(limit as string));
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: error.message } });
    }
  };

  getSolution = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const solution = await solutionService.getSolutionById(id);
      if (!solution) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Solution not found' } });
      res.json({ success: true, data: { solution } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: error.message } });
    }
  };

  updateSolution = async (req: Request, res: Response) => {
    try {
      const authorId = req.user?.id;
      if (!authorId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      
      const { id } = req.params;
      const { title, content, language } = req.body;
      const solution = await solutionService.updateSolution(id, authorId, { title, content, language });
      res.json({ success: true, data: { solution } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  };

  deleteSolution = async (req: Request, res: Response) => {
    try {
      const authorId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';
      if (!authorId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      
      const { id } = req.params;
      await solutionService.deleteSolution(id, authorId, isAdmin);
      res.json({ success: true, message: 'Solution deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'DELETE_FAILED', message: error.message } });
    }
  };
}

export default new SolutionController();
