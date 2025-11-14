import { Router } from 'express';
import problemController from '../controllers/problem.controller';
import testCaseController from '../controllers/testcase.controller';
import {
  createProblemValidation,
  updateProblemValidation,
  uploadTestCasesValidation,
} from '../utils/validation';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes (with optional auth for solved status)
router.get('/', optionalAuth, problemController.getProblems);
router.get('/topics', problemController.getTopics);
router.get('/:id', optionalAuth, problemController.getProblemById);
router.get('/slug/:slug', optionalAuth, problemController.getProblemBySlug);

// Test case routes
router.get('/:id/testcases', optionalAuth, testCaseController.getTestCases);

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createProblemValidation,
  problemController.createProblem
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateProblemValidation,
  problemController.updateProblem
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  problemController.deleteProblem
);

// Test case management (admin only)
router.post(
  '/:id/testcases',
  authenticate,
  authorize('ADMIN'),
  uploadTestCasesValidation,
  testCaseController.uploadTestCases
);

router.put(
  '/testcases/:id',
  authenticate,
  authorize('ADMIN'),
  testCaseController.updateTestCase
);

router.delete(
  '/testcases/:id',
  authenticate,
  authorize('ADMIN'),
  testCaseController.deleteTestCase
);

export default router;
