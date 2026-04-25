import { Request, Response } from 'express';
import commentService from '../services/comment.service';

export class CommentController {
  createComment = async (req: Request, res: Response) => {
    try {
      const authorId = req.user?.id;
      if (!authorId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      
      const { solutionId, content } = req.body;
      const comment = await commentService.createComment({ solutionId, authorId, content });
      res.status(201).json({ success: true, data: { comment } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
    }
  };

  getComments = async (req: Request, res: Response) => {
    try {
      const { solutionId } = req.query;
      if (!solutionId) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'solutionId is required' } });

      const comments = await commentService.getCommentsBySolution(solutionId as string);
      res.json({ success: true, data: { comments } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: error.message } });
    }
  };

  deleteComment = async (req: Request, res: Response) => {
    try {
      const authorId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';
      if (!authorId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      
      const { id } = req.params;
      await commentService.deleteComment(id, authorId, isAdmin);
      res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'DELETE_FAILED', message: error.message } });
    }
  };
}

export default new CommentController();
