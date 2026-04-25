import { Router } from 'express';
import classroomController from '../controllers/classroom.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createClassroomValidation, createAssignmentValidation } from '../utils/validation';

const router = Router();

router.use(authenticate);

// Student routes
router.post('/join', classroomController.joinClassroom);
router.get('/', classroomController.getClassrooms);
router.get('/:id', classroomController.getClassroomDetails);

// Instructor routes
router.post(
  '/',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  createClassroomValidation,
  validate,
  classroomController.createClassroom
);

router.post(
  '/:id/assignments',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  createAssignmentValidation,
  validate,
  classroomController.createAssignment
);
router.get(
  '/:id/leaderboard',
  classroomController.getLeaderboard
);
router.get(
  '/assignments/:assignmentId/progress',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  classroomController.getAssignmentProgress
);
router.get(
  '/:id/analytics',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  classroomController.getInstructorAnalytics
);

export default router;
