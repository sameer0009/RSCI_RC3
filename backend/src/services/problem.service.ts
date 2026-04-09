import prisma from '../config/database';
import { Difficulty, Problem, TestCase } from '@prisma/client';

interface CreateProblemData {
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
}

interface UpdateProblemData {
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
  difficulty?: Difficulty;
  topics?: string[];
  search?: string;
  userId?: string;
}

export class ProblemService {
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createProblem(data: CreateProblemData): Promise<Problem> {
    const slug = this.generateSlug(data.title);

    // Check if slug already exists
    const existingProblem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (existingProblem) {
      throw new Error('A problem with this title already exists');
    }

    const problem = await prisma.problem.create({
      data: {
        ...data,
        slug,
        timeLimit: data.timeLimit || 2000,
        memoryLimit: data.memoryLimit || 256,
      },
    });

    return problem;
  }

  async getProblems(
    filters: ProblemFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ problems: Problem[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.topics && filters.topics.length > 0) {
      where.topics = {
        hasSome: filters.topics,
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
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
              submissions: true,
              testCases: true,
            },
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    // If userId is provided, mark solved problems
    if (filters.userId) {
      const solvedProblems = await prisma.submission.findMany({
        where: {
          userId: filters.userId,
          verdict: 'Accepted',
        },
        select: {
          problemId: true,
        },
        distinct: ['problemId'],
      });

      const solvedIds = new Set(solvedProblems.map((s) => s.problemId));

      return {
        problems: problems.map((p: any) => ({
          ...p,
          isSolved: solvedIds.has(p.id),
        })),
        total,
        pages: Math.ceil(total / limit),
      };
    }

    return {
      problems,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getProblemById(
    id: string,
    includePrivateTests: boolean = false
  ): Promise<(Problem & { testCases: TestCase[] }) | null> {
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        testCases: {
          where: includePrivateTests ? {} : { isPublic: true },
          orderBy: { orderIndex: 'asc' },
        },
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return problem as any;
  }

  async getProblemBySlug(
    slug: string,
    includePrivateTests: boolean = false
  ): Promise<(Problem & { testCases: TestCase[] }) | null> {
    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: includePrivateTests ? {} : { isPublic: true },
          orderBy: { orderIndex: 'asc' },
        },
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return problem as any;
  }

  async updateProblem(id: string, data: UpdateProblemData): Promise<Problem> {
    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    let slug = problem.slug;
    if (data.title && data.title !== problem.title) {
      slug = this.generateSlug(data.title);

      const existingProblem = await prisma.problem.findUnique({
        where: { slug },
      });

      if (existingProblem && existingProblem.id !== id) {
        throw new Error('A problem with this title already exists');
      }
    }

    const updatedProblem = await prisma.problem.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });

    return updatedProblem;
  }

  async deleteProblem(id: string): Promise<void> {
    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    // Delete problem (cascade will handle test cases and submissions)
    await prisma.problem.delete({
      where: { id },
    });
  }

  async updateProblemStats(problemId: string): Promise<void> {
    const [totalSubmissions, acceptedSubmissions] = await Promise.all([
      prisma.submission.count({
        where: { problemId },
      }),
      prisma.submission.count({
        where: {
          problemId,
          verdict: 'Accepted',
        },
      }),
    ]);

    const acceptanceRate = totalSubmissions > 0 ? acceptedSubmissions / totalSubmissions : 0;

    await prisma.problem.update({
      where: { id: problemId },
      data: {
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate,
      },
    });
  }

  async getAllTopics(): Promise<string[]> {
    const problems = await prisma.problem.findMany({
      select: {
        topics: true,
      },
    });

    const topicsSet = new Set<string>();
    problems.forEach((p) => {
      p.topics.forEach((topic) => topicsSet.add(topic));
    });

    return Array.from(topicsSet).sort();
  }

  async getTestCaseGroups(problemId: string) {
    return prisma.testCaseGroup.findMany({
      where: { problemId },
      include: {
        testCases: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async createTestCaseGroup(problemId: string, data: any) {
    return prisma.testCaseGroup.create({
      data: {
        problemId,
        name: data.name,
        description: data.description,
        points: data.points || 0,
        orderIndex: data.orderIndex || 1,
      },
    });
  }

  async updateTestCaseGroup(groupId: string, data: any) {
    return prisma.testCaseGroup.update({
      where: { id: groupId },
      data: {
        name: data.name,
        description: data.description,
        points: data.points,
        orderIndex: data.orderIndex,
      },
    });
  }

  async deleteTestCaseGroup(groupId: string) {
    return prisma.testCaseGroup.delete({
      where: { id: groupId },
    });
  }
}

export default new ProblemService();
