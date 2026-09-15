import { fields } from '../middleware/input.middleware';
import { classroomAccess, problemSelection } from '../middleware/access.middleware';
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
  classroomAccess(true, false), classroomController.getAssignmentDetails
);

router.post(
  '/assignments/:assignmentId/submit',
  classroomAccess(true, false), classroomController.submitAssignment
);

router.get(
  '/assignments/:assignmentId/progress',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  classroomAccess(true, true), classroomController.getAssignmentProgress
);

router.put(
  '/assignments/:assignmentId',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  problemSelection, fields(['title', 'description', 'dueDate', 'problemIds']), classroomController.updateAssignment
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
router.get('/:id', classroomAccess(false, false), classroomController.getClassroomDetails);
router.get('/:id/leaderboard', classroomAccess(false, false), classroomController.getLeaderboard);
router.get('/:id/analytics', authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'), classroomAccess(false, true), classroomController.getInstructorAnalytics);

// Instructor routes
router.post(
  '/',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  createClassroomValidation,
  validate,
  fields(['name', 'description', 'instructorId']), classroomController.createClassroom
);

router.post(
  '/:id/assignments',
  authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN'),
  createAssignmentValidation,
  validate,
  problemSelection, fields(['title', 'description', 'dueDate', 'problemIds']), classroomController.createAssignment
);

router.put(
  '/:id',
  authorize('ADMIN'),
  fields(['name', 'description', 'instructorId']), classroomController.updateClassroom
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  classroomController.deleteClassroom
);

export default router;
