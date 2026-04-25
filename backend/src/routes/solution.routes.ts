import { Router } from 'express';
import solutionController from '../controllers/solution.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', solutionController.getSolutions);
router.get('/:id', solutionController.getSolution);
router.post('/', authenticate, solutionController.createSolution);
router.put('/:id', authenticate, solutionController.updateSolution);
router.delete('/:id', authenticate, solutionController.deleteSolution);

export default router;
