import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Problem management routes
const problemAuth = authorize('ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER');
router.post('/problems', problemAuth, adminController.createProblem);
router.get('/problems', problemAuth, adminController.listProblems);
router.get('/problems/:id', problemAuth, adminController.getProblem);
router.put('/problems/:id', problemAuth, adminController.updateProblem);
router.delete('/problems/:id', problemAuth, adminController.deleteProblem);
router.post('/problems/:id/testcases/bulk', problemAuth, adminController.bulkUploadTestCases);

// User management routes
const userAuth = authorize('ADMIN');
router.post('/users', userAuth, adminController.createUser);
router.get('/users/search', userAuth, adminController.searchUsers);
router.get('/users', userAuth, adminController.listUsers);
router.get('/users/:id', userAuth, adminController.getUser);
router.put('/users/:id', userAuth, adminController.updateUser);
router.delete('/users/:id', userAuth, adminController.deleteUser);

export default router;
