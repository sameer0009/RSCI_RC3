import prisma from '../config/database';
import crypto from 'crypto';

class ClassroomService {
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
    data: { title: string; description?: string; dueDate: Date; problemIds: string[] }
  ) {
    const { problemIds, ...assignmentData } = data;

    return prisma.assignment.create({
      data: {
        ...assignmentData,
        classroomId,
        problems: {
          connect: problemIds.map((id) => ({ id })),
        },
      },
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
              select: { id: true, title: true, difficulty: true },
            },
          },
        },
      },
    });
  }

  async getLeaderboard(classroomId: string) {
    const classroom = await this.getClassroomDetails(classroomId);
    if (!classroom) throw new Error('Classroom not found');

    const assignmentIds = classroom.assignments.map(a => a.id);

    // We can calculate leaderboard by counting unique problems solved in assignments
    const submissions = await prisma.submission.findMany({
      where: {
        userId: { in: classroom.members.map(m => m.userId) },
        verdict: 'Accepted',
        problemId: { in: classroom.assignments.flatMap(a => a.problems.map(p => p.id)) }
      },
      select: {
        userId: true,
        problemId: true
      }
    });

    const studentScores: Record<string, Set<string>> = {};
    for (const sub of submissions) {
      if (!studentScores[sub.userId]) {
        studentScores[sub.userId] = new Set();
      }
      studentScores[sub.userId].add(sub.problemId);
    }

    const leaderboard = classroom.members.map(member => ({
      user: member.user,
      problemsSolved: studentScores[member.userId]?.size || 0
    })).sort((a, b) => b.problemsSolved - a.problemsSolved);

    return leaderboard;
  }

  async getAssignmentProgress(assignmentId: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        problems: { select: { id: true, title: true } },
        classroom: {
          include: { members: { include: { user: { select: { id: true, username: true, fullName: true } } } } }
        }
      }
    });

    if (!assignment) throw new Error('Assignment not found');

    const submissions = await prisma.submission.findMany({
      where: {
        problemId: { in: assignment.problems.map(p => p.id) },
        userId: { in: assignment.classroom.members.map(m => m.userId) },
        submittedAt: { lte: assignment.dueDate }
      },
      orderBy: { submittedAt: 'asc' }
    });

    const progress = assignment.classroom.members.map(member => {
      const studentSubmissions = submissions.filter(s => s.userId === member.userId);
      const solvedProblems = new Set(
        studentSubmissions.filter(s => s.verdict === 'Accepted').map(s => s.problemId)
      );

      return {
        student: member.user,
        solvedCount: solvedProblems.size,
        totalProblems: assignment.problems.length,
        solvedProblemIds: Array.from(solvedProblems),
        attempts: studentSubmissions.length
      };
    });

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
