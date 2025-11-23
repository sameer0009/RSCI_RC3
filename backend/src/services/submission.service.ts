import prisma from '../config/database';
import judgeService from './judge.service';
import enhancedJudgeService from './enhancedJudge.service';
import problemService from './problem.service';
import { Submission, Verdict } from '@prisma/client';

interface CreateSubmissionData {
  userId: string;
  problemId: string;
  code: string;
  language: string;
  contestId?: string;
}

export class SubmissionService {
  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    const submission = await prisma.submission.create({
      data: {
        ...data,
        verdict: 'Pending',
      },
    });

    // Evaluate asynchronously
    this.evaluateSubmission(submission.id).catch((error) => {
      console.error('Evaluation error:', error);
    });

    return submission;
  }

  async evaluateSubmission(submissionId: string): Promise<void> {
    try {
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      // Use enhanced judge service for point-based evaluation
      await enhancedJudgeService.evaluateSubmission(
        submissionId,
        submission.code,
        submission.language,
        submission.problemId
      );

      // Update problem stats
      await problemService.updateProblemStats(submission.problemId);

      // Update user stats
      const leaderboardService = require('./leaderboard.service').default;
      await leaderboardService.updateUserStats(submission.userId);
    } catch (error) {
      console.error('Evaluation failed:', error);
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          verdict: 'RuntimeError',
          evaluatedAt: new Date(),
        },
      });
    }
  }

  async getSubmission(id: string): Promise<Submission | null> {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async getUserSubmissions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ submissions: Submission[]; total: number }> {
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          problem: {
            select: {
              title: true,
              slug: true,
              difficulty: true,
            },
          },
        },
      }),
      prisma.submission.count({ where: { userId } }),
    ]);

    return { submissions, total };
  }

  async runCode(code: string, language: string, input: string): Promise<any> {
    try {
      const result = await judgeService.executeCode(code, language, input);
      return {
        output: result.stdout || result.stderr || result.compile_output,
        status: result.status.description,
        time: result.time,
        memory: result.memory,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Code execution failed');
    }
  }

  async runSampleTests(problemId: string, code: string, language: string): Promise<any> {
    try {
      const results = await enhancedJudgeService.runSampleTests(code, language, problemId);
      return results;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to run sample tests');
    }
  }
}

export default new SubmissionService();
