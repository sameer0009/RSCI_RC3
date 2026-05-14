import { Request, Response } from 'express';
import classroomService from '../services/classroom.service';

export class ClassroomController {
  createClassroom = async (req: Request, res: Response) => {
    try {
      const isAdmin = (req as any).user.role === 'ADMIN';
      const instructorId = (isAdmin && req.body.instructorId) ? req.body.instructorId : (req as any).user.id;
      const classroom = await classroomService.createClassroom(instructorId, req.body);

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
  };

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
  };

  getClassrooms = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const role = (req as any).user.role;

      let classrooms;
      if (role === 'ADMIN') {
        classrooms = await classroomService.getAllClassrooms();
      } else if (role === 'INSTRUCTOR' || role === 'CONTEST_MANAGER') {
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
  };

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
  };

  createAssignment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // classroomId
      const userId = (req as any).user.id;
      const assignment = await classroomService.createAssignment(id, userId, req.body);

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
  };

  updateAssignment = async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const userId = (req as any).user.id;
      const assignment = await classroomService.updateAssignment(assignmentId, userId, req.body);

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'UPDATE_ASSIGNMENT_FAILED', message: error.message },
      });
    }
  };

  deleteAssignment = async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const userId = (req as any).user.id;
      await classroomService.deleteAssignment(assignmentId, userId);

      res.json({
        success: true,
        message: 'Assignment deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'DELETE_ASSIGNMENT_FAILED', message: error.message },
      });
    }
  };

  getLeaderboard = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const leaderboard = await classroomService.getLeaderboard(id);
      res.json({ success: true, data: leaderboard });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'FETCH_LEADERBOARD_FAILED', message: error.message } });
    }
  };

  getAssignmentDetails = async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const userId = (req as any).user.id;
      const details = await classroomService.getAssignmentDetails(assignmentId, userId);
      res.json({ success: true, data: details });
    } catch (error: any) {
      console.error(`[getAssignmentDetails] Error: ${error.message}`);
      const status = error.message.includes('access') ? 403 : 404;
      res.status(status).json({ 
        success: false, 
        error: { 
          code: status === 403 ? 'ACCESS_DENIED' : 'FETCH_ASSIGNMENT_FAILED', 
          message: error.message 
        } 
      });
    }
  };

  getAssignmentProgress = async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const progress = await classroomService.getAssignmentProgress(assignmentId);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'FETCH_PROGRESS_FAILED', message: error.message } });
    }
  };

  getInstructorAnalytics = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const analytics = await classroomService.getInstructorAnalytics(id);
      res.json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'FETCH_ANALYTICS_FAILED', message: error.message } });
    }
  };

  updateClassroom = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const classroom = await classroomService.updateClassroom(id, req.body);
      res.json({ success: true, data: classroom });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'UPDATE_CLASSROOM_FAILED', message: error.message } });
    }
  };

  deleteClassroom = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await classroomService.deleteClassroom(id);
      res.json({ success: true, message: 'Classroom deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { code: 'DELETE_CLASSROOM_FAILED', message: error.message } });
    }
  };

  submitAssignment = async (req: Request, res: Response) => {
    try {
      const { assignmentId } = req.params;
      const userId = (req as any).user.id;
      const submission = await classroomService.submitAssignment(assignmentId, userId);

      res.status(201).json({
        success: true,
        data: submission,
        message: 'Assignment submitted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { code: 'SUBMIT_ASSIGNMENT_FAILED', message: error.message },
      });
    }
  };
}

export default new ClassroomController();
