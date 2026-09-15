import { fields, problemFields } from '../middleware/input.middleware';
import { ownsResource, readableProblem } from '../middleware/access.middleware';
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
router.get('/:id', optionalAuth, readableProblem('id'), problemController.getProblemById);

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
router.get('/slug/:slug', optionalAuth, readableProblem('slug'), problemController.getProblemBySlug);

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
router.get('/:id/testcases', optionalAuth, readableProblem(), testCaseController.getTestCases);

// Test case group routes
router.get('/:id/groups', authenticate, authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'), ownsResource('problem'), problemController.getTestCaseGroups);
router.post('/:id/groups', authenticate, authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'), ownsResource('problem'), problemController.createTestCaseGroup);
router.put(
  '/groups/:groupId',
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'),
  ownsResource('testCaseGroup', 'groupId'), problemController.updateTestCaseGroup
);
router.delete(
  '/groups/:groupId',
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'),
  ownsResource('testCaseGroup', 'groupId'), problemController.deleteTestCaseGroup
);

// Admin, Instructor, Problem Setter routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'),
  createProblemValidation,
  validate,
  fields(problemFields), problemController.createProblem
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'),
  updateProblemValidation,
  validate,
  ownsResource('problem', 'id'), fields(problemFields), problemController.updateProblem
);

router.delete('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'), ownsResource('problem', 'id'), problemController.deleteProblem);

// Test case management
router.post(
  '/:id/testcases',
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'),
  uploadTestCasesValidation,
  validate,
  ownsResource('problem', 'id'), testCaseController.uploadTestCases
);

router.put('/testcases/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'), ownsResource('testCase', 'id'), fields(['input','expectedOutput','isPublic','visibility','points','orderIndex','timeLimit','memoryLimit','description','groupId']), testCaseController.updateTestCase);

router.delete(
  '/testcases/:id',
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER'),
  ownsResource('testCase', 'id'), testCaseController.deleteTestCase
);

export default router;
