import { Router } from 'express';
import voteController from '../controllers/vote.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { voteValidation } from '../utils/validation';

const router = Router();

router.post('/', authenticate, voteValidation, validate, voteController.toggleVote);

export default router;
