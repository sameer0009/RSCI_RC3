import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Problem management routes
router.post('/problems', adminController.createProblem);
router.get('/problems', adminController.listProblems);
router.get('/problems/:id', adminController.getProblem);
router.put('/problems/:id', adminController.updateProblem);
router.delete('/problems/:id', adminController.deleteProblem);
router.post('/problems/:id/testcases/bulk', adminController.bulkUploadTestCases);

// User management routes
router.get('/users/search', adminController.searchUsers);
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

export default router;
