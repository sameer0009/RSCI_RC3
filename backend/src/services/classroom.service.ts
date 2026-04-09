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
}

export default new ClassroomService();
