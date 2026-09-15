import { communityAccess } from '../middleware/access.middleware';
import { Router } from 'express';
import solutionController from '../controllers/solution.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', communityAccess('problem', 'query', 'problemId'), solutionController.getSolutions);
router.get('/:id', communityAccess('solution', 'params', 'id'), solutionController.getSolution);
router.post('/', authenticate, communityAccess('problem', 'body', 'problemId'), solutionController.createSolution);
router.put('/:id', authenticate, solutionController.updateSolution);
router.delete('/:id', authenticate, solutionController.deleteSolution);

export default router;
