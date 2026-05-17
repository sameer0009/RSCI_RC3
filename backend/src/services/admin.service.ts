import { Difficulty, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../config/database';

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
  points?: number;
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
  points?: number;
}

interface ProblemFilters {
  page?: number;
  limit?: number;
  difficulty?: Difficulty;
  search?: string;
}

interface UpdateUserDto {
  role?: Role;
  fullName?: string;
  email?: string;
}

interface UserFilters {
  page?: number;
  limit?: number;
  role?: Role;
  search?: string;
}

interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: Role;
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
        points: data.points || 100,
        allowedLanguages: [],
        status: 'PUBLISHED',
        testCases: data.testCases
          ? {
              create: data.testCases.map((tc, index) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isPublic: tc.isPublic,
                points: tc.points,
                orderIndex: index,
              })),
            }
          : undefined,
      },
      include: {
        testCases: true,
      },
    });

    return problem;
  }

  async updateProblem(id: string, rawData: any) {
    // Check if problem exists
    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Problem not found');
    }

    // Separate testCases from main problem data
    const { testCases, ...data } = rawData;
    console.log('--- ADMIN SERVICE updateProblem ---');
    console.log('rawData testCases:', testCases);
    console.log('rawData data:', data);

    // Update slug if title changed
    let slug = existing.slug;
    if (data.title && data.title !== existing.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Perform database operations in a transaction
    const problem = await prisma.$transaction(async (tx) => {
      // 1. Update the problem
      await tx.problem.update({
        where: { id },
        data: {
          ...data,
          slug,
          updatedAt: new Date(),
        },
      });

      // 2. If testCases are provided, delete old ones and recreate
      if (testCases && Array.isArray(testCases)) {
        await tx.testCase.deleteMany({ where: { problemId: id } });
        
        if (testCases.length > 0) {
          await tx.testCase.createMany({
            data: testCases.map((tc, index) => ({
              problemId: id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isPublic: tc.isPublic,
              points: tc.points ?? 10,
              orderIndex: index,
            })),
          });
        }
      }

      // 3. Return problem with updated test cases
      return tx.problem.findUnique({
        where: { id },
        include: {
          testCases: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
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
   * Get problem details by ID
   */
  async getProblem(id: string) {
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        testCases: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
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
        { topics: { has: filters.search } },
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
              submissions: true,
            },
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    return {
      problems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Bulk upload test cases
   */
  async bulkUploadTestCases(
    problemId: string,
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isPublic: boolean;
      points: number;
    }>
  ) {
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
        orderIndex: index,
      })),
    });

    return { success: true, count: created.count };
  }

  // ============ USER MANAGEMENT ============

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDto) {
    const { username, email, password, fullName, role } = data;

    // Security check: Don't allow creating admins through this endpoint
    if (role === Role.ADMIN) {
      throw new Error('Cannot create an admin user through this endpoint');
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      if (existing.email === email) throw new Error('Email already registered');
      if (existing.username === username) throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        fullName,
        notificationSetting: {
          create: {}, // Default settings
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

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
        { fullName: { contains: filters.search, mode: 'insensitive' } },
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
          profilePicture: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
    if (data.role === 'STUDENT' && existing.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        rating: true,
        problemsSolved: true,
      },
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
          { fullName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        profilePicture: true,
      },
    });

    return users;
  }
}

export default new AdminService();
