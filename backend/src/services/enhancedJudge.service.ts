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
  rust: 73,
  typescript: 74,
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
    language: string | number,
    input: string,
    timeLimit: number = 2000,
    memoryLimit: number = 256000
  ): Promise<ExecutionResult> {
    try {
      let languageId: number | undefined;

      if (typeof language === 'number') {
        languageId = language;
      } else if (!isNaN(Number(language))) {
        languageId = Number(language);
      } else {
        languageId = LANGUAGE_IDS[language.toLowerCase()];
      }

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
          enable_network: false,
          wall_time_limit: Math.max(5, timeLimit / 1000 * 3),
        },
        {
          timeout: 30000,
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
      if (error.response) {
        console.error('Judge0 API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Judge0 Network Error (No response):', error.message);
      } else {
        console.error('Judge0 Setup Error:', error.message);
      }
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  async evaluateSubmission(
    submissionId: string,
    code: string,
    language: string | number,
    problemId: string
  ): Promise<SubmissionResult> {
    const problem = await prisma.problem.findUnique({ where: { id: problemId }, include: { testCases: { include: { group: true }, orderBy: { orderIndex: 'asc' } }, testCaseGroups: { orderBy: { orderIndex: 'asc' } } } });
    if (!problem) throw new Error('Problem not found');
    const tests = problem.testCases.filter(test => test.visibility !== 'STRESS');
    if (!tests.length) throw new Error('No scoring test cases configured');
    if (problem.problemType !== 'STANDARD' || problem.validationStrategy === 'CUSTOM_CHECKER') throw new Error('This judging mode is not supported');
    const results: TestCaseResult[] = [];
    let overallVerdict = 'Accepted';
    for (const test of tests) {
      // Infrastructure errors propagate to BullMQ and are retried, never blamed on the student.
      const execution = await this.executeCode(code, language, test.input, test.timeLimit ?? problem.timeLimit, (test.memoryLimit ?? problem.memoryLimit) * 1024);
      let verdict = this.getVerdictFromStatus(execution.status.id);
      if (verdict === 'Pending' || execution.status.id === 13) throw new Error('Judge has not returned a final result');
      if (verdict === 'Accepted' && !this.compareOutput(execution.stdout, test.expectedOutput, problem.validationStrategy, problem.floatingPointEpsilon)) verdict = 'WrongAnswer';
      if (overallVerdict === 'Accepted' && verdict !== 'Accepted') overallVerdict = verdict;
      results.push({ testCaseId: test.id, verdict, executionTime: Math.round(Number(execution.time) * 1000) || 0, memoryUsed: Math.round(Number(execution.memory)) || 0, points: verdict === 'Accepted' ? test.points : 0, maxPoints: test.points, visibility: test.visibility,
        output: test.isPublic || test.visibility === 'SAMPLE' ? execution.stdout || '' : undefined,
        errorMessage: test.isPublic || test.visibility === 'SAMPLE' ? execution.stderr || execution.compile_output || undefined : undefined });
      if (verdict === 'CompilationError') break;
    }
    const passed = new Set(results.filter(r => r.verdict === 'Accepted').map(r => r.testCaseId));
    let earned = 0, maximum = 0;
    const groupResults: GroupResult[] = [];
    const groupsPassed = new Map<string, boolean>();
    const visiting = new Set<string>();
    const groupPassed = (id: string): boolean => {
      if (groupsPassed.has(id)) return groupsPassed.get(id)!;
      if (visiting.has(id)) throw new Error('Cyclic test group dependency');
      const group = problem.testCaseGroups.find(g => g.id === id);
      if (!group) throw new Error('Missing test group dependency');
      visiting.add(id);
      const members = tests.filter(t => t.groupId === id);
      const success = members.length > 0 && members.every(t => passed.has(t.id)) && (!group.dependsOnGroup || groupPassed(group.dependsOnGroup));
      visiting.delete(id); groupsPassed.set(id, success); return success;
    };
    for (const group of problem.testCaseGroups) {
      const members = tests.filter(t => t.groupId === group.id);
      if (!members.length) continue;
      const weight = group.points > 0 ? group.points : members.reduce((sum, t) => sum + t.points, 0);
      const score = groupPassed(group.id) ? weight : 0;
      maximum += weight; earned += score;
      groupResults.push({ groupName: group.name, score, maxScore: weight, passed: members.filter(t => passed.has(t.id)).length, total: members.length });
    }
    for (const test of tests.filter(t => !t.groupId)) { maximum += test.points; if (passed.has(test.id)) earned += test.points; }
    if (!problem.enablePartialScoring && overallVerdict !== 'Accepted') earned = 0;
    const score = maximum > 0 ? earned / maximum * 100 : overallVerdict === 'Accepted' ? 100 : 0;
    const executionTime = Math.max(0, ...results.map(r => r.executionTime));
    const memoryUsed = Math.max(0, ...results.map(r => r.memoryUsed));
    await prisma.$transaction(async tx => {
      await tx.testCaseResult.deleteMany({ where: { submissionId } });
      await tx.testCaseResult.createMany({ data: results.map(r => ({ submissionId, testCaseId: r.testCaseId, verdict: r.verdict as any, executionTime: r.executionTime, memoryUsed: r.memoryUsed, output: r.output, errorMessage: r.errorMessage, points: r.points })) });
      await tx.submission.update({ where: { id: submissionId }, data: { verdict: overallVerdict as any, score, maxScore: 100, points: Math.round(earned), executionTime, memoryUsed, testCasesPassed: passed.size, totalTestCases: tests.length, evaluatedAt: new Date() } });
    });
    return { verdict: overallVerdict, score, maxScore: 100, testCasesPassed: passed.size, totalTestCases: tests.length, executionTime, memoryUsed, testCaseResults: results, groupResults };
  }

  compareOutput(
    actual: string | null,
    expected: string,
    strategy: string = 'IGNORE_WHITESPACE',
    epsilon?: number | null
  ): boolean {
    const trimmedExpected = expected.trimEnd();
    if (!actual) return trimmedExpected === '';

    switch (strategy) {
      case 'EXACT_MATCH':
        return actual.trimEnd() === expected.trimEnd();

      case 'IGNORE_WHITESPACE':
      case 'TOKEN_BASED':
        return actual.trim().split(/\s+/).join(' ') === expected.trim().split(/\s+/).join(' ');

      case 'FLOATING_POINT':
        return this.compareFloatingPoint(actual, expected, epsilon ?? 1e-6);

      default:
        throw new Error(`Unsupported validation strategy: ${strategy}`);
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
    if (!Number.isFinite(epsilon) || epsilon < 0) return false;
    const actualTokens = actual.trim().split(/\s+/);
    const expectedTokens = expected.trim().split(/\s+/);

    if (actualTokens.length !== expectedTokens.length) {
      return false;
    }

    for (let i = 0; i < actualTokens.length; i++) {
      const actualNum = Number(actualTokens[i]);
      const expectedNum = Number(expectedTokens[i]);

      if (!Number.isFinite(actualNum) || !Number.isFinite(expectedNum)) {
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
      case 13:
        return 'RuntimeError';
      default:
        return 'Pending';
    }
  }

  async runSampleTests(
    code: string,
    language: string | number,
    problemId: string
  ): Promise<TestCaseResult[]> {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        testCases: {
          where: {
            OR: [
              { visibility: 'SAMPLE' },
              { isPublic: true },
            ],
          },
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
          verdict: isCorrect ? 'Accepted' : (verdict === 'Accepted' ? 'WrongAnswer' : verdict),
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
