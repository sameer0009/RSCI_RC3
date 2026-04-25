import { Router } from 'express';
import problemController from '../controllers/problem.controller';
import testCaseController from '../controllers/testcase.controller';
import submissionController from '../controllers/submission.controller';
import {
  createProblemValidation,
  updateProblemValidation,
  uploadTestCasesValidation,
} from '../utils/validation';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Problems
 *   description: Problem management and retrieval
 */

/**
 * @swagger
 * /api/problems:
 *   get:
 *     summary: Get all problems
 *     tags: [Problems]
 *     parameters:
 *       - in: query
 *         name: topic
 *         schema: { type: string }
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [Easy, Medium, Hard] }
 *     responses:
 *       200:
 *         description: List of problems
 */
router.get('/', optionalAuth, problemController.getProblems);

/**
 * @swagger
 * /api/problems/topics:
 *   get:
 *     summary: Get all problem topics
 *     tags: [Problems]
 *     responses:
 *       200:
 *         description: List of topics
 */
router.get('/topics', problemController.getTopics);

/**
 * @swagger
 * /api/problems/{id}:
 *   get:
 *     summary: Get problem by ID
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Problem details
 */
router.get('/:id', optionalAuth, problemController.getProblemById);

/**
 * @swagger
 * /api/problems/slug/{slug}:
 *   get:
 *     summary: Get problem by slug
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Problem details
 */
router.get('/slug/:slug', optionalAuth, problemController.getProblemBySlug);

/**
 * @swagger
 * /api/problems/{problemId}/submissions:
 *   get:
 *     summary: Get user submissions for a problem
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of submissions
 */
router.get('/:problemId/submissions', authenticate, submissionController.getUserSubmissionsForProblem);

// Test case routes
router.get('/:id/testcases', optionalAuth, testCaseController.getTestCases);

// Test case group routes
router.get('/:id/groups', authenticate, problemController.getTestCaseGroups);
router.post('/:id/groups', authenticate, authorize('ADMIN'), problemController.createTestCaseGroup);
router.put(
  '/groups/:groupId',
  authenticate,
  authorize('ADMIN'),
  problemController.updateTestCaseGroup
);
router.delete(
  '/groups/:groupId',
  authenticate,
  authorize('ADMIN'),
  problemController.deleteTestCaseGroup
);

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createProblemValidation,
  validate,
  problemController.createProblem
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateProblemValidation,
  validate,
  problemController.updateProblem
);

router.delete('/:id', authenticate, authorize('ADMIN'), problemController.deleteProblem);

// Test case management (admin only)
router.post(
  '/:id/testcases',
  authenticate,
  authorize('ADMIN'),
  uploadTestCasesValidation,
  validate,
  testCaseController.uploadTestCases
);

router.put('/testcases/:id', authenticate, authorize('ADMIN'), testCaseController.updateTestCase);

router.delete(
  '/testcases/:id',
  authenticate,
  authorize('ADMIN'),
  testCaseController.deleteTestCase
);

export default router;
