import { Request, Response } from 'express';
import classroomService from '../services/classroom.service';

export class ClassroomController {
  createClassroom = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const classroom = await classroomService.createClassroom(userId, req.body);

      res.status(201).json({
        success: true,
        data: classroom,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'CREATE_CLASSROOM_FAILED', message: error.message },
      });
    }
  }

  joinClassroom = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { code } = req.body;
      const member = await classroomService.joinClassroom(userId, code);

      res.json({
        success: true,
        data: member,
        message: 'Joined classroom successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'JOIN_CLASSROOM_FAILED', message: error.message },
      });
    }
  }

  getClassrooms = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const role = (req as any).user.role;

      let classrooms;
      if (role === 'CONTEST_MANAGER' || role === 'ADMIN') {
        classrooms = await classroomService.getInstructorClassrooms(userId);
      } else {
        classrooms = await classroomService.getStudentClassrooms(userId);
      }

      res.json({
        success: true,
        data: classrooms,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_CLASSROOMS_FAILED', message: error.message },
      });
    }
  }

  getClassroomDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const classroom = await classroomService.getClassroomDetails(id);

      if (!classroom) {
        return res.status(404).json({
          success: false,
          error: { code: 'CLASSROOM_NOT_FOUND', message: 'Classroom not found' },
        });
      }

      res.json({
        success: true,
        data: classroom,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_CLASSROOM_DETAILS_FAILED', message: error.message },
      });
    }
  }

  createAssignment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // classroomId
      const assignment = await classroomService.createAssignment(id, req.body);

      res.status(201).json({
        success: true,
        data: assignment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'CREATE_ASSIGNMENT_FAILED', message: error.message },
      });
    }
  }
}

export default new ClassroomController();
