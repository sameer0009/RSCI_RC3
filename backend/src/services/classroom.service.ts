import prisma from '../config/database';
import crypto from 'crypto';
import { Role } from '@prisma/client';

class ClassroomService {
  async getAllClassrooms() {
    return prisma.classroom.findMany({
      include: {
        instructor: { select: { username: true, fullName: true } },
        _count: { select: { members: true, assignments: true } },
      },
    });
  }

  async updateClassroom(id: string, data: { name?: string; description?: string; instructorId?: string }) {
    return prisma.classroom.update({
      where: { id },
      data,
    });
  }

  async deleteClassroom(id: string) {
    return prisma.classroom.delete({
      where: { id },
    });
  }
  async createClassroom(instructorId: string, data: { name: string; description?: string }) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char unique code

    return prisma.classroom.create({
      data: {
        ...data,
        code,
        instructorId,
      },
    });
  }

  async getClassroomByCode(code: string) {
    return prisma.classroom.findUnique({
      where: { code },
      include: {
        instructor: {
          select: { username: true, fullName: true, profilePicture: true },
        },
      },
    });
  }

  async joinClassroom(userId: string, code: string) {
    const classroom = await this.getClassroomByCode(code);
    if (!classroom) throw new Error('Classroom not found');

    return prisma.classroomMember.create({
      data: {
        classroomId: classroom.id,
        userId,
      },
    });
  }

  async getInstructorClassrooms(instructorId: string) {
    return prisma.classroom.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: { members: true, assignments: true },
        },
      },
    });
  }

  async getStudentClassrooms(userId: string) {
    return prisma.classroomMember.findMany({
      where: { userId },
      include: {
        classroom: {
          include: {
            instructor: {
              select: { username: true, fullName: true },
            },
          },
        },
      },
    });
  }

  async createAssignment(
    classroomId: string,
    userId: string,
    data: { title: string; description?: string; dueDate: string | Date; problemIds: string[] }
  ) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId }
    });

    if (!classroom) throw new Error('Classroom not found');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (classroom.instructorId !== userId && !isAdmin) {
      throw new Error('You do not have permission to create assignments in this classroom');
    }

    const { problemIds, ...assignmentData } = data;

    return prisma.assignment.create({
      data: {
        ...assignmentData,
        dueDate: new Date(assignmentData.dueDate),
        classroomId,
        problems: {
          connect: problemIds.map((id) => ({ id })),
        },
      },
    });
  }

  async updateAssignment(
    assignmentId: string,
    userId: string,
    data: { title?: string; description?: string; dueDate?: string | Date; problemIds?: string[] }
  ) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classroom: true }
    });

    if (!assignment) throw new Error('Assignment not found');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (assignment.classroom.instructorId !== userId && !isAdmin) {
      throw new Error('You do not have permission to update this assignment');
    }

    const { problemIds, ...assignmentData } = data;

    return prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...assignmentData,
        ...(assignmentData.dueDate && { dueDate: new Date(assignmentData.dueDate) }),
        ...(problemIds && {
          problems: {
            set: problemIds.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async deleteAssignment(assignmentId: string, userId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classroom: true }
    });

    if (!assignment) throw new Error('Assignment not found');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (assignment.classroom.instructorId !== userId && !isAdmin) {
      throw new Error('You do not have permission to delete this assignment');
    }

    return prisma.assignment.delete({
      where: { id: assignmentId },
    });
  }

  async getClassroomDetails(classroomId: string) {
    return prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, rating: true },
            },
          },
        },
        assignments: {
          include: {
            problems: {
              select: { id: true, title: true, slug: true, difficulty: true },
            },
          },
        },
      },
    });
  }

  async getAssignmentDetails(assignmentId: string, userId: string) {
    if (!assignmentId) throw new Error('Assignment ID is required');

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        problems: {
          select: { id: true, title: true, slug: true, difficulty: true, topics: true },
        },
        classroom: {
          include: {
            members: { where: { userId } },
            instructor: { select: { id: true } }
          }
        },
        submissions: {
          where: { userId }
        }
      },
    });

    if (!assignment) throw new Error('Assignment not found');

    const isInstructor = assignment.classroom.instructorId === userId;
    
    const member = await prisma.classroomMember.findFirst({
      where: { 
        classroomId: assignment.classroomId, 
        userId 
      }
    });
    
    const isMember = !!member;

    // Log for debugging
    console.log(`[ACCESS DEBUG] User: ${userId}, Assignment: ${assignmentId}, Classroom: ${assignment.classroomId}, isMember: ${isMember}, isInstructor: ${isInstructor}`);

    if (!isMember && !isInstructor) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const hasElevatedAccess = user && ([Role.ADMIN, Role.CONTEST_MANAGER, Role.INSTRUCTOR] as Role[]).includes(user.role as Role);
      
      if (!hasElevatedAccess) {
        throw new Error(`Access Denied: You are not a member of classroom ${assignment.classroomId}.`);
      }
    }

    const userSubmission = assignment.submissions[0];
    const submissionCutoff = userSubmission ? userSubmission.submittedAt : assignment.dueDate;

    const acceptedSubmissions = await prisma.submission.findMany({
      where: {
        userId,
        problemId: { in: assignment.problems.map((p) => p.id) },
        verdict: 'Accepted',
        submittedAt: { 
          gte: assignment.createdAt,
          lte: submissionCutoff 
        },
      },
      select: { problemId: true },
    });

    const solvedProblemIds = acceptedSubmissions.map((s) => s.problemId);

    return {
      ...assignment,
      solvedProblemIds,
      userSubmission: assignment.submissions?.[0] || null
    };
  }

  async submitAssignment(assignmentId: string, userId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: {
          include: {
            members: { where: { userId } }
          }
        }
      }
    });

    if (!assignment) throw new Error('Assignment not found');
    if (assignment.classroom.members.length === 0) {
      throw new Error('You are not a member of this classroom');
    }

    // Check if already submitted
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: { assignmentId, userId }
      }
    });

    if (existingSubmission) {
      throw new Error('Assignment already submitted');
    }

    return prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        userId,
        status: 'SUBMITTED'
      }
    });
  }

  async getLeaderboard(classroomId: string) {
    const classroom = await this.getClassroomDetails(classroomId);
    if (!classroom) throw new Error('Classroom not found');

    // We can calculate leaderboard by counting unique problems solved in assignments
    const submissions = await prisma.submission.findMany({
      where: {
        userId: { in: classroom.members.map(m => m.userId) },
        problemId: { in: classroom.assignments.flatMap(a => a.problems.map(p => p.id)) },
        submittedAt: { gte: classroom.createdAt }
      },
      select: {
        userId: true,
        problemId: true,
        verdict: true
      }
    });

    const studentStats: Record<string, { solved: Set<string>, attempts: number }> = {};
    for (const sub of submissions) {
      if (!studentStats[sub.userId]) {
        studentStats[sub.userId] = { solved: new Set(), attempts: 0 };
      }
      studentStats[sub.userId].attempts++;
      if (sub.verdict === 'Accepted') {
        studentStats[sub.userId].solved.add(sub.problemId);
      }
    }

    const leaderboard = classroom.members.map(member => ({
      userId: member.userId,
      username: member.user.username,
      fullName: member.user.fullName,
      problemsSolved: studentStats[member.userId]?.solved.size || 0,
      totalAttempts: studentStats[member.userId]?.attempts || 0,
    })).sort((a, b) => b.problemsSolved - a.problemsSolved || a.totalAttempts - b.totalAttempts);

    return leaderboard;
  }

  async getAssignmentProgress(assignmentId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        problems: { select: { id: true, title: true, slug: true } },
        classroom: {
          include: { members: { include: { user: { select: { id: true, username: true, fullName: true } } } } }
        },
        submissions: true
      }
    });

    if (!assignment) throw new Error('Assignment not found');

    // Loophole Fix: For each student, fetch ALL submissions (including failures) 
    // to accurately count attempts and solve status within the window.
    const progress = await Promise.all(assignment.classroom.members.map(async (member) => {
      const userSubmission = assignment.submissions.find(s => s.userId === member.userId);
      const cutoff = userSubmission ? userSubmission.submittedAt : assignment.dueDate;

      const allSubsInWindow = await prisma.submission.findMany({
        where: {
          problemId: { in: assignment.problems.map(p => p.id) },
          userId: member.userId,
          submittedAt: { 
            gte: assignment.createdAt,
            lte: cutoff 
          }
        },
        select: { 
          problemId: true,
          verdict: true
        }
      });

      const solvedProblemIds = Array.from(new Set(
        allSubsInWindow
          .filter(s => s.verdict === 'Accepted')
          .map(s => s.problemId)
      ));

      return {
        student: member.user,
        solvedCount: solvedProblemIds.length,
        totalProblems: assignment.problems.length,
        solvedProblemIds,
        attempts: allSubsInWindow.length, // Counts ALL attempts (AC, WA, TLE, etc.)
        isSubmitted: !!userSubmission
      };
    }));

    return {
      assignment,
      progress
    };
  }

  async getInstructorAnalytics(classroomId: string) {
    const classroom = await this.getClassroomDetails(classroomId);
    if (!classroom) throw new Error('Classroom not found');

    const studentIds = classroom.members.map(m => m.userId);
    const problemIds = classroom.assignments.flatMap(a => a.problems.map(p => p.id));

    const allSubmissions = await prisma.submission.findMany({
      where: {
        userId: { in: studentIds },
        problemId: { in: problemIds }
      },
      include: {
        problem: { select: { id: true, difficulty: true, topics: true } }
      }
    });

    // Per-student submission history and average solve time is complex without start time.
    // We will calculate success rate, total attempts, and struggling topics.
    
    const analytics = classroom.members.map(member => {
      const subs = allSubmissions.filter(s => s.userId === member.userId);
      const totalAttempts = subs.length;
      const accepted = subs.filter(s => s.verdict === 'Accepted').length;
      
      const topicFails: Record<string, number> = {};
      subs.filter(s => s.verdict !== 'Accepted').forEach(s => {
        s.problem.topics.forEach(topic => {
          topicFails[topic] = (topicFails[topic] || 0) + 1;
        });
      });

      const strugglingTopics = Object.entries(topicFails)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => e[0]);

      return {
        student: member.user,
        totalAttempts,
        successRate: totalAttempts > 0 ? (accepted / totalAttempts) * 100 : 0,
        strugglingTopics
      };
    });

    return analytics;
  }
}

export default new ClassroomService();
