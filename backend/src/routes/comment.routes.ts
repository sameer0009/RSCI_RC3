import { communityAccess } from '../middleware/access.middleware';
import { Router } from 'express';
import commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { commentValidation } from '../utils/validation';

const router = Router();

router.get('/', communityAccess('solution', 'query', 'solutionId'), commentController.getComments);
router.post('/', authenticate, commentValidation, validate, communityAccess('solution', 'body', 'solutionId'), commentController.createComment);
router.delete('/:id', authenticate, commentController.deleteComment);

export default router;
