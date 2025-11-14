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
        points: data.points || 10,
      },
    });

    return testCase;
  }

  async createMultipleTestCases(testCases: CreateTestCaseData[]): Promise<TestCase[]> {
    const created = await prisma.testCase.createMany({
      data: testCases.map((tc) => ({
        ...tc,
        points: tc.points || 10,
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
    const testCase = await prisma.testCase.update({
      where: { id },
      data,
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
