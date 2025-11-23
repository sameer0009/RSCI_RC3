import { Router } from 'express';
import submissionController from '../controllers/submission.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All submission routes require authentication
router.post('/', authenticate, submissionController.submitCode);
router.post('/run', authenticate, submissionController.runCode);
router.post('/sample-tests', authenticate, submissionController.runSampleTests);
router.get('/:id', authenticate, submissionController.getSubmission);
router.get('/user/:userId', authenticate, submissionController.getUserSubmissions);

export default router;
