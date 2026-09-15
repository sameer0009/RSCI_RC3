import { fields, problemFields } from '../middleware/input.middleware';
import { ownsResource } from '../middleware/access.middleware';
import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Problem management routes
const problemAuth = authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER', 'CONTEST_MANAGER');
router.post('/problems', problemAuth, fields(problemFields), adminController.createProblem);
router.get('/problems', problemAuth, adminController.listProblems);
router.get('/problems/:id', problemAuth, ownsResource('problem'), adminController.getProblem);
router.put('/problems/:id', problemAuth, ownsResource('problem'), fields(problemFields), adminController.updateProblem);
router.delete('/problems/:id', problemAuth, ownsResource('problem'), adminController.deleteProblem);
router.post('/problems/:id/testcases/bulk', problemAuth, ownsResource('problem'), adminController.bulkUploadTestCases);

// User management routes
const userAuth = authorize('ADMIN');
router.post('/users', userAuth, adminController.createUser);
router.get('/users/search', userAuth, adminController.searchUsers);
router.get('/users', userAuth, adminController.listUsers);
router.get('/users/:id', userAuth, adminController.getUser);
router.put('/users/:id', userAuth, adminController.updateUser);
router.delete('/users/:id', userAuth, adminController.deleteUser);

export default router;
