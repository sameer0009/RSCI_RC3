import prisma from '../config/database';
import { TestCase } from '@prisma/client';

interface CreateTestCaseData {
  problemId: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points?: number;
  orderIndex: number;
}

export class TestCaseService {
  async createTestCase(data: CreateTestCaseData): Promise<TestCase> {
    const testCase = await prisma.testCase.create({
      data: {
        ...data,
        visibility: (data as any).visibility || (data.isPublic ? 'SAMPLE' : 'HIDDEN'),
        points: data.points ?? 10,
      },
    });

    return testCase;
  }

  async createMultipleTestCases(testCases: CreateTestCaseData[]): Promise<TestCase[]> {
    for (const tc of testCases) {
      if ((tc as any).groupId) {
        const group = await prisma.testCaseGroup.findUnique({ where: { id: (tc as any).groupId } });
        if (!group || group.problemId !== tc.problemId) throw new Error('Group does not belong to this problem');
      }
    }
    const created = await prisma.testCase.createMany({
      data: testCases.map((tc) => ({
        ...tc,
        visibility: (tc as any).visibility || (tc.isPublic ? 'SAMPLE' : 'HIDDEN'),
        points: tc.points ?? 10,
      })),
    });

    // Fetch the created test cases
    const problemIds = [...new Set(testCases.map((tc) => tc.problemId))];
    const createdTestCases = await prisma.testCase.findMany({
      where: {
        problemId: {
          in: problemIds,
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return createdTestCases;
  }

  async getTestCasesByProblemId(
    problemId: string,
    includePrivate: boolean = false
  ): Promise<TestCase[]> {
    const testCases = await prisma.testCase.findMany({
      where: {
        problemId,
        ...(includePrivate ? {} : { isPublic: true }),
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return testCases;
  }

  async updateTestCase(id: string, data: Partial<CreateTestCaseData>): Promise<TestCase> {
    const existing = await prisma.testCase.findUnique({ where: { id } });
    if (!existing) throw new Error('Test case not found');
    if ((data as any).groupId) {
      const group = await prisma.testCaseGroup.findUnique({ where: { id: (data as any).groupId } });
      if (!group || group.problemId !== existing.problemId) throw new Error('Group does not belong to this problem');
    }
    const testCase = await prisma.testCase.update({
      where: { id },
      data: { ...data, ...(data.isPublic === undefined ? {} : { visibility: (data as any).visibility || (data.isPublic ? 'SAMPLE' : 'HIDDEN') }) },
    });

    return testCase;
  }

  async deleteTestCase(id: string): Promise<void> {
    await prisma.testCase.delete({
      where: { id },
    });
  }

  async deleteTestCasesByProblemId(problemId: string): Promise<void> {
    await prisma.testCase.deleteMany({
      where: { problemId },
    });
  }
}

export default new TestCaseService();
