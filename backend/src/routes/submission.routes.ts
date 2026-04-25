import { Router } from 'express';
import submissionController from '../controllers/submission.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { submitCodeValidation, runCodeValidation } from '../utils/validation';

const router = Router();

// All submission routes require authentication
/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Code execution and submission management
 */

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Submit code for evaluation
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [problemId, languageId, sourceCode]
 *             properties:
 *               problemId: { type: string }
 *               languageId: { type: integer }
 *               sourceCode: { type: string }
 *     responses:
 *       201:
 *         description: Submission created
 */
router.post('/', authenticate, submitCodeValidation, validate, submissionController.submitCode);

/**
 * @swagger
 * /api/submissions/run:
 *   post:
 *     summary: Run code with custom input
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [languageId, sourceCode]
 *             properties:
 *               languageId: { type: integer }
 *               sourceCode: { type: string }
 *               stdin: { type: string }
 *     responses:
 *       200:
 *         description: Run result
 */
router.post('/run', authenticate, runCodeValidation, validate, submissionController.runCode);

/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Get submission details
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Submission status and details
 */
router.get('/:id', authenticate, submissionController.getSubmission);

/**
 * @swagger
 * /api/submissions/sample-tests:
 *   post:
 *     summary: Run code against sample test cases
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sample test results
 */
router.post('/sample-tests', authenticate, submissionController.runSampleTests);

/**
 * @swagger
 * /api/submissions/user/{userId}:
 *   get:
 *     summary: Get all submissions for a specific user
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of user submissions
 */
router.get('/user/:userId', authenticate, submissionController.getUserSubmissions);

export default router;
