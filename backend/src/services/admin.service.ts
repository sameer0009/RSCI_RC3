import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateProblemDto {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: Difficulty;
  topics: string[];
  timeLimit?: number;
  memoryLimit?: number;
  createdBy: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
    points: number;
  }>;
}

interface UpdateProblemDto {
  title?: string;
  description?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  difficulty?: Difficulty;
  topics?: string[];
  timeLimit?: number;
  memoryLimit?: number;
}

interface ProblemFilters {
  page?: number;
  limit?: number;
  difficulty?: Difficulty;
  search?: string;
}

interface UpdateUserDto {
  role?: 'USER' | 'ADMIN';
  fullName?: string;
  email?: string;
}

interface UserFilters {
  page?: number;
  limit?: number;
  role?: 'USER' | 'ADMIN';
  search?: string;
}

class AdminService {
  // ============ PROBLEM MANAGEMENT ============

  /**
   * Create a new problem
   */
  async createProblem(data: CreateProblemDto) {
    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existing = await prisma.problem.findUnique({ where: { slug } });
    if (existing) {
      throw new Error('A problem with this title already exists');
    }

    // Create problem with test cases
    const problem = await prisma.problem.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        inputFormat: data.inputFormat,
        outputFormat: data.outputFormat,
        constraints: data.constraints,
        difficulty: data.difficulty,
        topics: data.topics,
        timeLimit: data.timeLimit || 2000,
        memoryLimit: data.memoryLimit || 256,
        createdBy: data.createdBy,
        testCases: data.testCases ? {
          create: data.testCases.map((tc, index) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isPublic: tc.isPublic,
            points: tc.points,
            orderIndex: index
          }))
        } : undefined
      },
      include: {
        testCases: true
      }
    });

    return problem;
  }

  /**
   * Update a problem
   */
  async updateProblem(id: string, data: UpdateProblemDto) {
    // Check if problem exists
    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Problem not found');
    }

    // Update slug if title changed
    let slug = existing.slug;
    if (data.title && data.title !== existing.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const problem = await prisma.problem.update({
      where: { id },
      data: {
        ...data,
        slug,
        updatedAt: new Date()
      },
      include: {
        testCases: true
      }
    });

    return problem;
  }

  /**
   * Delete a problem
   */
  async deleteProblem(id: string) {
    // Check if problem exists
    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Problem not found');
    }

    // Delete problem (test cases will be cascade deleted)
    await prisma.problem.delete({ where: { id } });

    return { success: true, message: 'Problem deleted successfully' };
  }

  /**
   * List all problems with filters
   */
  async listProblems(filters: ProblemFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { topics: { has: filters.search } }
      ];
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              testCases: true,
              submissions: true
            }
          }
        }
      }),
      prisma.problem.count({ where })
    ]);

    return {
      problems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Bulk upload test cases
   */
  async bulkUploadTestCases(problemId: string, testCases: Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
    points: number;
  }>) {
    // Check if problem exists
    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new Error('Problem not found');
    }

    // Delete existing test cases
    await prisma.testCase.deleteMany({ where: { problemId } });

    // Create new test cases
    const created = await prisma.testCase.createMany({
      data: testCases.map((tc, index) => ({
        problemId,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isPublic: tc.isPublic,
        points: tc.points,
        orderIndex: index
      }))
    });

    return { success: true, count: created.count };
  }

  // ============ USER MANAGEMENT ============

  /**
   * List all users with filters
   */
  async listUsers(filters: UserFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.search) {
      where.OR = [
        { username: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { fullName: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          rating: true,
          problemsSolved: true,
          totalSubmissions: true,
          createdAt: true,
          profilePicture: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDto) {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('User not found');
    }

    // Prevent deleting last admin
    if (data.role === 'USER' && existing.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        rating: true,
        problemsSolved: true
      }
    });

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('User not found');
    }

    // Prevent deleting last admin
    if (existing.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin');
      }
    }

    // Delete user (submissions will be cascade deleted)
    await prisma.user.delete({ where: { id } });

    return { success: true, message: 'User deleted successfully' };
  }

  /**
   * Search users
   */
  async searchUsers(query: string) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        profilePicture: true
      }
    });

    return users;
  }
}

export default new AdminService();
