import { contestScore } from '../utils/contest-score';
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
import { addSubmissionJob, submissionQueue } from '../queues/submission.queue';

export class SubmissionService {
  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    const problem = await prisma.problem.findUnique({ where: { id: data.problemId }, include: { _count: { select: { testCases: true } } } });
    if (!problem || problem._count.testCases === 0) throw new Error('Problem is not ready for submissions');
    if (Buffer.byteLength(data.code, 'utf8') > problem.maxSourceSize) throw new Error('Source code exceeds the problem size limit');
    if (problem.allowedLanguages.length && !problem.allowedLanguages.includes(String(data.language))) throw new Error('Language is not allowed for this problem');
    // Contest membership, time, and problem association must all hold.

    if (data.contestId) {
      const contest = await prisma.contest.findUnique({ where: { id: data.contestId }, include: { problems: { select: { id: true } } } });
      const now = new Date();
      if (!contest || now < contest.startTime || now >= contest.endTime) throw new Error('Contest is not accepting submissions');
      if (!contest.problems.some(p => p.id === data.problemId)) throw new Error('Problem does not belong to this contest');
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
    await addSubmissionJob(submission.id).catch(async (error) => {
      await prisma.submission.delete({ where: { id: submission.id } });
      throw new Error('Grading is unavailable. Please try again shortly.');
    });

    return submission;
  }

  async evaluateSubmission(submissionId: string): Promise<void> {
    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new Error('Submission not found');
    // Retried jobs must not regrade a result already committed to the database.
    if (!submission.evaluatedAt) await enhancedJudgeService.evaluateSubmission(submissionId, submission.code, submission.language, submission.problemId);
    const result = await this.getSubmission(submissionId);
    if (!result) return;
    if (result.contestId) await this.handleContestSubmission(result);
    await problemService.updateProblemStats(result.problemId);
    const leaderboardService = require('./leaderboard.service').default;
    await leaderboardService.updateUserStats(result.userId);
    io.to(submissionId).emit('submissionUpdate', result);
    // Notification delivery cannot turn accepted code into a runtime error.
    try {
      const notificationService = require('./notification.service').default;
      await notificationService.createNotification(result.userId, 'SUBMISSION', 'Submission Evaluated', `Your submission has been evaluated with verdict: ${result.verdict}`, `/problems/${result.problem.slug}`);
    } catch (error) { console.error('Submission notification failed', error); }
  }

  private async handleContestSubmission(submission: Submission) {
    await prisma.$transaction(async tx => {
      const contestId = submission.contestId!;
      // Lock this participant row so simultaneous jobs cannot overwrite newer totals.
      await tx.contestParticipant.update({ where: { contestId_userId: { contestId, userId: submission.userId } }, data: { penalty: { increment: 0 } } });
      const contest = await tx.contest.findUnique({ where: { id: contestId }, include: { problems: { select: { id: true, points: true } } } });
      if (!contest) return;
      const submissions = await tx.submission.findMany({ where: { contestId, userId: submission.userId, submittedAt: { gte: contest.startTime, lt: contest.endTime } } });
      const score = contestScore(submissions, contest.startTime, new Map(contest.problems.map(p => [p.id, p.points])));
      await tx.contestParticipant.update({ where: { contestId_userId: { contestId, userId: submission.userId } }, data: score });
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

    if (submission.verdict === 'Pending') {
      const job = await submissionQueue.getJob(id);
      if (job && await job.getState() === 'failed') return { ...submission, code: submission.code, testCaseResults: [], verdict: 'JudgeError', error: 'Grading service failed after retries. Please contact your instructor or try again.' };
    }
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
