import { Router } from 'express';
import commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { commentValidation } from '../utils/validation';

const router = Router();

router.get('/', commentController.getComments);
router.post('/', authenticate, commentValidation, validate, commentController.createComment);
router.delete('/:id', authenticate, commentController.deleteComment);

export default router;
