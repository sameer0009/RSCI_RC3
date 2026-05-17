import prisma from '../config/database';
import judgeService from './judge.service';
import enhancedJudgeService from './enhancedJudge.service';
import problemService from './problem.service';
import { Submission, Verdict } from '@prisma/client';

interface CreateSubmissionData {
  userId: string;
  problemId: string;
  code: string;
  language: string | number;
  contestId?: string;
}

import { io } from '../index';
import { addSubmissionJob } from '../queues/submission.queue';

export class SubmissionService {
  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    // 1. Contest participant check
    if (data.contestId) {
      const participant = await prisma.contestParticipant.findUnique({
        where: {
          contestId_userId: {
            contestId: data.contestId,
            userId: data.userId
          }
        }
      });
      if (!participant) {
        throw new Error('You are not a participant in this contest');
      }
    }

    const submission = await prisma.submission.create({
      data: {
        ...data,
        language: data.language.toString(),
        verdict: 'Pending',
      },
    });

    // Add to evaluation queue
    await addSubmissionJob(submission.id).catch((error) => {
      console.error('Queue error:', error);
    });

    return submission;
  }

  async evaluateSubmission(submissionId: string): Promise<void> {
    try {
      let submission = await prisma.submission.findUnique({
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

      // Fetch and sanitize the updated submission to emit it to the client
      const sanitizedSubmission = await this.getSubmission(submissionId);

      if (sanitizedSubmission) {
        // Emit Socket.IO event to the submission's room
        io.to(submissionId).emit('submissionUpdate', sanitizedSubmission);

        // Notify user
        const notificationService = require('./notification.service').default;
        await notificationService.createNotification(
          sanitizedSubmission.userId,
          'SUBMISSION',
          'Submission Evaluated',
          `Your submission has been evaluated with verdict: ${sanitizedSubmission.verdict}`,
          `/problems/${sanitizedSubmission.problemId}`
        );
      }

      if (sanitizedSubmission) {
        // Update problem stats
        await problemService.updateProblemStats(sanitizedSubmission.problemId);

        // Update user stats
        const leaderboardService = require('./leaderboard.service').default;
        await leaderboardService.updateUserStats(sanitizedSubmission.userId);

        // CONTEST HANDLING
        if (sanitizedSubmission.contestId && sanitizedSubmission.verdict === 'Accepted') {
          await this.handleContestSubmission(sanitizedSubmission);
        }
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
      const submission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          verdict: 'RuntimeError',
          evaluatedAt: new Date(),
        },
      });
      // Emit Socket.IO event even on error
      io.to(submissionId).emit('submissionUpdate', submission);
    }
  }

  private async handleContestSubmission(submission: Submission) {
    const contest = await prisma.contest.findUnique({
      where: { id: submission.contestId! },
    });

    if (!contest || contest.status !== 'Active') return;

    // Calculate time penalty (minutes since start)
    const minutesSinceStart = Math.floor(
      (submission.submittedAt.getTime() - contest.startTime.getTime()) / 60000
    );

    // Count previous wrong attempts for this problem in this contest
    const previousAttempts = await prisma.submission.count({
      where: {
        contestId: submission.contestId,
        userId: submission.userId,
        problemId: submission.problemId,
        submittedAt: { lt: submission.submittedAt },
        verdict: { notIn: ['Accepted', 'Pending', 'CompilationError'] },
      },
    });

    const penalty = minutesSinceStart + previousAttempts * 20;

    // Check if user already has an AC for this problem
    const existingAC = await prisma.submission.findFirst({
      where: {
        contestId: submission.contestId,
        userId: submission.userId,
        problemId: submission.problemId,
        submittedAt: { lt: submission.submittedAt },
        verdict: 'Accepted',
      },
    });

    if (existingAC) return; // Only count first AC

    // Get problem points
    const problem = await prisma.problem.findUnique({
      where: { id: submission.problemId },
    });

    const points = (problem as any)?.points || 100;

    // Update contest participant
    await prisma.contestParticipant.update({
      where: {
        contestId_userId: {
          contestId: submission.contestId!,
          userId: submission.userId,
        },
      },
      data: {
        totalPoints: { increment: points },
        penalty: { increment: penalty },
        problemsSolved: { increment: 1 },
        lastSubmissionTime: submission.submittedAt,
      },
    });
  }

  async getSubmission(id: string): Promise<any | null> {
    const submission = await prisma.submission.findUnique({
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
        testCaseResults: true,
      },
    });

    if (!submission) return null;

    // Query public test case IDs for this problem
    const publicTestCases = await prisma.testCase.findMany({
      where: {
        problemId: submission.problemId,
        OR: [
          { isPublic: true },
          { visibility: 'SAMPLE' }
        ]
      },
      select: { id: true }
    });
    const publicTestCaseIds = new Set(publicTestCases.map(tc => tc.id));

    // Filter testCaseResults to keep only public/sample ones
    const publicResults = (submission.testCaseResults || []).filter(
      (result) => publicTestCaseIds.has(result.testCaseId)
    );

    return {
      ...submission,
      totalTestCases: publicTestCaseIds.size,
      testCasesPassed: publicResults.filter(r => r.verdict === 'Accepted').length,
      testCaseResults: publicResults,
    };
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

  async getUserSubmissionsForProblem(
    userId: string,
    problemId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ submissions: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: { userId, problemId },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          testCaseResults: true,
        },
      }),
      prisma.submission.count({ where: { userId, problemId } }),
    ]);

    // Query public test case IDs for this problem
    const publicTestCases = await prisma.testCase.findMany({
      where: {
        problemId,
        OR: [
          { isPublic: true },
          { visibility: 'SAMPLE' }
        ]
      },
      select: { id: true }
    });
    const publicTestCaseIds = new Set(publicTestCases.map(tc => tc.id));

    // Sanitize each submission in the list
    const sanitizedSubmissions = submissions.map((sub) => {
      const publicResults = (sub.testCaseResults || []).filter(
        (result) => publicTestCaseIds.has(result.testCaseId)
      );
      return {
        ...sub,
        totalTestCases: publicTestCaseIds.size,
        testCasesPassed: publicResults.filter(r => r.verdict === 'Accepted').length,
        testCaseResults: publicResults,
      };
    });

    return { submissions: sanitizedSubmissions, total };
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
