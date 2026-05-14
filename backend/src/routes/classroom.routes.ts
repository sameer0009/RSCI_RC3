import { Router } from 'express';
import classroomController from '../controllers/classroom.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createClassroomValidation, createAssignmentValidation } from '../utils/validation';

const router = Router();

router.use(authenticate);

// Specific routes first
router.get(
  '/assignments/:assignmentId',
  classroomController.getAssignmentDetails
);

router.post(
  '/assignments/:assignmentId/submit',
  classroomController.submitAssignment
);

router.get(
  '/assignments/:assignmentId/progress',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  classroomController.getAssignmentProgress
);

router.put(
  '/assignments/:assignmentId',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  classroomController.updateAssignment
);

router.delete(
  '/assignments/:assignmentId',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  classroomController.deleteAssignment
);

// Student routes
router.post('/join', classroomController.joinClassroom);
router.get('/', classroomController.getClassrooms);

// Classroom specific routes
router.get('/:id', classroomController.getClassroomDetails);
router.get('/:id/leaderboard', classroomController.getLeaderboard);
router.get('/:id/analytics', authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'), classroomController.getInstructorAnalytics);

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

router.put(
  '/:id',
  authorize('ADMIN'),
  classroomController.updateClassroom
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  classroomController.deleteClassroom
);

export default router;
