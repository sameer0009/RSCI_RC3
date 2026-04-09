import axios from 'axios';
import prisma from '../config/database';

interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}

interface TestCaseResult {
  testCaseId: string;
  verdict: string;
  executionTime: number;
  memoryUsed: number;
  output?: string;
  errorMessage?: string;
  points: number;
  maxPoints: number;
  groupName?: string;
  visibility: string;
}

interface SubmissionResult {
  verdict: string;
  score: number;
  maxScore: number;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
  testCaseResults: TestCaseResult[];
  groupResults: GroupResult[];
}

interface GroupResult {
  groupName: string;
  score: number;
  maxScore: number;
  passed: number;
  total: number;
}

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  csharp: 51,
  go: 60,
  php: 68,
};

export class EnhancedJudgeService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY || '';
  }

  async executeCode(
    code: string,
    language: string,
    input: string,
    timeLimit: number = 2000,
    memoryLimit: number = 256000
  ): Promise<ExecutionResult> {
    try {
      const languageId = LANGUAGE_IDS[language.toLowerCase()];
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const submissionResponse = await axios.post(
        `${this.apiUrl}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: languageId,
          stdin: input,
          cpu_time_limit: timeLimit / 1000,
          memory_limit: memoryLimit,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey
              ? {
                  'X-RapidAPI-Key': this.apiKey,
                  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                }
              : {}),
          },
        }
      );

      return submissionResponse.data;
    } catch (error: any) {
      console.error('Judge0 execution error:', error.response?.data || error.message);
      throw new Error('Code execution failed');
    }
  }

  async evaluateSubmission(
    submissionId: string,
    code: string,
    language: string,
    problemId: string
  ): Promise<SubmissionResult> {
    // Fetch problem with test cases and groups
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          include: {
            group: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
        testCaseGroups: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    const testCaseResults: TestCaseResult[] = [];
    const groupScores = new Map<
      string,
      { score: number; maxScore: number; passed: number; total: number }
    >();

    let totalScore = 0;
    let maxScore = 0;
    let testCasesPassed = 0;
    let maxExecutionTime = 0;
    let maxMemoryUsed = 0;
    let overallVerdict = 'Accepted';
    let compilationError = false;

    // Initialize group scores
    for (const group of problem.testCaseGroups) {
      groupScores.set(group.id, {
        score: 0,
        maxScore: group.points,
        passed: 0,
        total: 0,
      });
    }

    // Execute test cases
    for (const testCase of problem.testCases) {
      const timeLimit = testCase.timeLimit || problem.timeLimit;
      const memoryLimit = testCase.memoryLimit || problem.memoryLimit;

      try {
        const result = await this.executeCode(
          code,
          language,
          testCase.input,
          timeLimit,
          memoryLimit * 1024 // Convert KB to bytes
        );

        const verdict = this.getVerdictFromStatus(result.status.id);
        const executionTime = parseFloat(result.time) * 1000; // Convert to ms
        const memoryUsed = result.memory;

        maxExecutionTime = Math.max(maxExecutionTime, executionTime);
        maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsed);

        // Check if compilation error
        if (verdict === 'CompilationError') {
          compilationError = true;
          overallVerdict = 'CompilationError';
        }

        // Determine points earned
        let pointsEarned = 0;
        const maxPoints = testCase.points;

        if (verdict === 'Accepted') {
          const isCorrect = this.compareOutput(
            result.stdout,
            testCase.expectedOutput,
            problem.validationStrategy,
            problem.floatingPointEpsilon
          );

          if (isCorrect) {
            pointsEarned = maxPoints;
            testCasesPassed++;
          } else {
            overallVerdict = 'WrongAnswer';
          }
        } else {
          if (overallVerdict === 'Accepted') {
            overallVerdict = verdict;
          }
        }

        totalScore += pointsEarned;
        maxScore += maxPoints;

        // Update group scores
        if (testCase.groupId) {
          const groupScore = groupScores.get(testCase.groupId);
          if (groupScore) {
            groupScore.score += pointsEarned;
            groupScore.maxScore += maxPoints;
            groupScore.total++;
            if (pointsEarned === maxPoints) {
              groupScore.passed++;
            }
          }
        }

        // Store test case result
        const testCaseResult: TestCaseResult = {
          testCaseId: testCase.id,
          verdict,
          executionTime,
          memoryUsed,
          points: pointsEarned,
          maxPoints,
          groupName: testCase.group?.name,
          visibility: testCase.visibility,
        };

        // Include output for sample test cases
        if (testCase.visibility === 'SAMPLE') {
          testCaseResult.output = result.stdout || '';
          testCaseResult.errorMessage = result.stderr || result.compile_output || undefined;
        }

        testCaseResults.push(testCaseResult);

        // Save to database
        await prisma.testCaseResult.create({
          data: {
            submissionId,
            testCaseId: testCase.id,
            verdict: verdict as any,
            executionTime: Math.round(executionTime),
            memoryUsed,
            output: testCase.visibility === 'SAMPLE' ? result.stdout : null,
            errorMessage: result.stderr || result.compile_output || null,
            points: pointsEarned,
          },
        });

        // Stop on compilation error
        if (compilationError) {
          break;
        }
      } catch (error: any) {
        console.error(`Test case ${testCase.id} execution error:`, error.message);

        testCaseResults.push({
          testCaseId: testCase.id,
          verdict: 'RuntimeError',
          executionTime: 0,
          memoryUsed: 0,
          points: 0,
          maxPoints: testCase.points,
          errorMessage: error.message,
          groupName: testCase.group?.name,
          visibility: testCase.visibility,
        });

        maxScore += testCase.points;
        overallVerdict = 'RuntimeError';
      }
    }

    // Calculate final score percentage
    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Build group results
    const groupResults: GroupResult[] = [];
    for (const group of problem.testCaseGroups) {
      const groupScore = groupScores.get(group.id);
      if (groupScore) {
        groupResults.push({
          groupName: group.name,
          score: groupScore.score,
          maxScore: groupScore.maxScore,
          passed: groupScore.passed,
          total: groupScore.total,
        });
      }
    }

    // Update submission
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        verdict: overallVerdict as any,
        score: scorePercentage,
        maxScore: 100,
        points: totalScore,
        executionTime: Math.round(maxExecutionTime),
        memoryUsed: Math.round(maxMemoryUsed),
        testCasesPassed,
        totalTestCases: problem.testCases.length,
        evaluatedAt: new Date(),
      },
    });

    return {
      verdict: overallVerdict,
      score: scorePercentage,
      maxScore: 100,
      testCasesPassed,
      totalTestCases: problem.testCases.length,
      executionTime: Math.round(maxExecutionTime),
      memoryUsed: Math.round(maxMemoryUsed),
      testCaseResults,
      groupResults,
    };
  }

  compareOutput(
    actual: string | null,
    expected: string,
    strategy: string = 'IGNORE_WHITESPACE',
    epsilon?: number | null
  ): boolean {
    if (!actual) return false;

    switch (strategy) {
      case 'EXACT_MATCH':
        return actual === expected;

      case 'IGNORE_WHITESPACE':
      case 'TOKEN_BASED':
        return this.normalizeOutput(actual) === this.normalizeOutput(expected);

      case 'FLOATING_POINT':
        return this.compareFloatingPoint(actual, expected, epsilon || 1e-6);

      default:
        return this.normalizeOutput(actual) === this.normalizeOutput(expected);
    }
  }

  private normalizeOutput(str: string): string {
    return str
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }

  private compareFloatingPoint(actual: string, expected: string, epsilon: number): boolean {
    const actualTokens = actual.trim().split(/\s+/);
    const expectedTokens = expected.trim().split(/\s+/);

    if (actualTokens.length !== expectedTokens.length) {
      return false;
    }

    for (let i = 0; i < actualTokens.length; i++) {
      const actualNum = parseFloat(actualTokens[i]);
      const expectedNum = parseFloat(expectedTokens[i]);

      if (isNaN(actualNum) || isNaN(expectedNum)) {
        if (actualTokens[i] !== expectedTokens[i]) {
          return false;
        }
      } else {
        if (Math.abs(actualNum - expectedNum) > epsilon) {
          return false;
        }
      }
    }

    return true;
  }

  getVerdictFromStatus(statusId: number): string {
    switch (statusId) {
      case 3:
        return 'Accepted';
      case 4:
        return 'WrongAnswer';
      case 5:
        return 'TimeLimitExceeded';
      case 6:
        return 'CompilationError';
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return 'RuntimeError';
      default:
        return 'Pending';
    }
  }

  async runSampleTests(
    code: string,
    language: string,
    problemId: string
  ): Promise<TestCaseResult[]> {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          where: { visibility: 'SAMPLE' },
          include: { group: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    const results: TestCaseResult[] = [];

    for (const testCase of problem.testCases) {
      try {
        const result = await this.executeCode(
          code,
          language,
          testCase.input,
          testCase.timeLimit || problem.timeLimit,
          (testCase.memoryLimit || problem.memoryLimit) * 1024
        );

        const verdict = this.getVerdictFromStatus(result.status.id);
        const isCorrect =
          verdict === 'Accepted' &&
          this.compareOutput(
            result.stdout,
            testCase.expectedOutput,
            problem.validationStrategy,
            problem.floatingPointEpsilon
          );

        results.push({
          testCaseId: testCase.id,
          verdict: isCorrect ? 'Accepted' : verdict,
          executionTime: parseFloat(result.time) * 1000,
          memoryUsed: result.memory,
          output: result.stdout || '',
          errorMessage: result.stderr || result.compile_output || undefined,
          points: isCorrect ? testCase.points : 0,
          maxPoints: testCase.points,
          groupName: testCase.group?.name,
          visibility: testCase.visibility,
        });
      } catch (error: any) {
        results.push({
          testCaseId: testCase.id,
          verdict: 'RuntimeError',
          executionTime: 0,
          memoryUsed: 0,
          output: '',
          errorMessage: error.message,
          points: 0,
          maxPoints: testCase.points,
          groupName: testCase.group?.name,
          visibility: testCase.visibility,
        });
      }
    }

    return results;
  }
}

export default new EnhancedJudgeService();
