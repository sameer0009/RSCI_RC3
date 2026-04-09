import { Router } from 'express';
import classroomController from '../controllers/classroom.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Student routes
router.post('/join', classroomController.joinClassroom);
router.get('/', classroomController.getClassrooms);
router.get('/:id', classroomController.getClassroomDetails);

// Instructor routes
router.post('/', authorize('CONTEST_MANAGER', 'ADMIN'), classroomController.createClassroom);
router.post('/:id/assignments', authorize('CONTEST_MANAGER', 'ADMIN'), classroomController.createAssignment);

export default router;
