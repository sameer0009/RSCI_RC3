import { contestScore } from '../utils/contest-score';
import prisma from '../config/database';
import { ContestStatus } from '@prisma/client';
import { RatingService } from './rating.service';
import bcrypt from 'bcrypt';

class ContestService {
  async createContest(data: any) {
    const { problemIds, ...contestData } = data;
    
    if (contestData.duration) {
      contestData.duration = parseInt(contestData.duration, 10);
    }

    if (!Number.isFinite(new Date(contestData.startTime).getTime()) || !Number.isFinite(new Date(contestData.endTime).getTime()) || new Date(contestData.endTime) <= new Date(contestData.startTime)) throw new Error('End time must be after start time');
    if (contestData.password) contestData.password = await bcrypt.hash(contestData.password, 10);
    return prisma.contest.create({
      data: {
        ...contestData,
        problems: problemIds ? {
          connect: problemIds.map((id: string) => ({ id })),
        } : undefined,
      },
    });
  }

  async updateContest(id: string, data: any) {
    const { problemIds, ...contestData } = data;
    
    if (contestData.duration) {
      contestData.duration = parseInt(contestData.duration, 10);
    }

    const existing = await prisma.contest.findUnique({ where: { id } });
    if (!existing) throw new Error('Contest not found');
    const start = new Date(contestData.startTime ?? existing.startTime);
    const end = new Date(contestData.endTime ?? existing.endTime);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) throw new Error('End time must be after start time');
    if (contestData.password) contestData.password = await bcrypt.hash(contestData.password, 10);
    else delete contestData.password;
    return prisma.contest.update({
      where: { id },
      data: {
        ...contestData,
        problems: problemIds ? {
          set: problemIds.map((pid: string) => ({ id: pid })),
        } : undefined,
      },
    });
  }

  async deleteContest(id: string) {
    return prisma.contest.delete({
      where: { id },
    });
  }

  async getContest(id: string) {
    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
          select: { id: true, title: true, difficulty: true },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (contest) {
      delete (contest as any).password;
    }

    return contest;
  }

  async registerUser(contestId: string, userId: string, password?: string) {
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new Error('Contest not found');
    if (contest.endTime < new Date() || contest.status === 'Ended') throw new Error('Contest already ended');

    if (!contest.isPublic) {
      if (!password || !contest.password || !(contest.password.startsWith('$2') ? await bcrypt.compare(password, contest.password) : password === contest.password)) {
        throw new Error('Incorrect password for private contest');
      }
    }

    return prisma.contestParticipant.create({
      data: {
        contestId,
        userId,
      },
    });
  }

  async getContests(page = 1, limit = 20, status?: string, createdBy?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = { isPublic: true };
    if (status) where.status = status as ContestStatus;
    if (createdBy) {
      where.createdBy = createdBy;
      delete where.isPublic; // If they are fetching their own contests, include private ones too
    }

    const [contests, total] = await Promise.all([
      prisma.contest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          _count: { select: { participants: true } },
        },
      }),
      prisma.contest.count({ where }),
    ]);

    // Remove passwords from the list
    const safeContests = contests.map((c) => {
      delete (c as any).password;
      return c;
    });

    return {
      contests: safeContests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getLeaderboard(contestId: string) {
    const contest = await prisma.contest.findUnique({ where: { id: contestId }, include: { problems: { select: { id: true, points: true } } } });
    if (!contest) throw new Error('Contest not found');
    const now = new Date();
    const freeze = new Date(Math.max(contest.startTime.getTime(), contest.endTime.getTime() - Math.max(0, contest.frozenDuration) * 60000));
    const cutoff = now < contest.endTime && now >= freeze ? freeze : now < contest.endTime ? now : contest.endTime;
    const [participants, submissions] = await Promise.all([
      prisma.contestParticipant.findMany({ where: { contestId }, include: { user: { select: { username: true, rating: true, id: true } } } }),
      prisma.submission.findMany({ where: { contestId, submittedAt: { gte: contest.startTime, lt: cutoff } }, select: { id: true, userId: true, problemId: true, verdict: true, submittedAt: true } }),
    ]);
    const points = new Map(contest.problems.map(p => [p.id, p.points]));
    const board = participants.map(p => ({ ...p, ...contestScore(submissions.filter(s => s.userId === p.userId), contest.startTime, points) })).sort((a, b) => b.problemsSolved - a.problemsSolved || a.penalty - b.penalty || a.userId.localeCompare(b.userId));
    let rank = 0;
    return board.map((entry, index) => {
      if (!index || entry.problemsSolved !== board[index - 1].problemsSolved || entry.penalty !== board[index - 1].penalty) rank = index + 1;
      return { ...entry, rank };
    });
  }

  async getContestProblems(contestId: string, userId: string, isAdmin: boolean) {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: { problems: true },
    });

    if (!contest) throw new Error('Contest not found');

    if (!isAdmin && new Date() < contest.startTime) {
      throw new Error('Contest has not started yet');
    }

    if (!isAdmin) {
      const isRegistered = await prisma.contestParticipant.findUnique({
        where: { contestId_userId: { contestId, userId } },
      });
      if (!isRegistered) throw new Error('You must register for this contest');
    }

    return contest.problems;
  }

  async getActiveContests() {
    return prisma.contest.findMany({
      where: {
        status: ContestStatus.Active,
      },
      include: {
        _count: { select: { participants: true } },
      },
    });
  }

  /**
   * Virtual Contest Logic:
   * Returns a version of the contest where the "start time" is relative to when the user clicks 'Start'.
   * This allows users to practice past contests with a real-time experience.
   */
  async startVirtualContest(contestId: string, userId: string) {
    const originalContest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!originalContest) throw new Error('Original contest not found');
    if (originalContest.endTime > new Date())
      throw new Error('Contest is still ongoing. Only past contests can be taken virtually.');

    // In a full implementation, we'd store the virtual start time for this user.
    // For now, we'll return the metadata.
    return {
      id: originalContest.id,
      title: originalContest.title,
      duration: originalContest.duration,
      isVirtual: true,
      virtualStartTime: new Date(),
      virtualEndTime: new Date(Date.now() + originalContest.duration * 60000),
    };
  }

  async updateContestStatus() {
    const now = new Date();

    // Notify for contests starting in 15 minutes
    const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);
    const fourteenMinsFromNow = new Date(now.getTime() + 14 * 60000);

    const upcomingContests = await prisma.contest.findMany({
      where: {
        status: ContestStatus.Upcoming,
        startTime: {
          gt: fourteenMinsFromNow,
          lte: fifteenMinsFromNow,
        },
      },
      include: { participants: true },
    });

    const notificationService = require('./notification.service').default;
    for (const contest of upcomingContests) {
      for (const participant of contest.participants) {
        await notificationService.createNotification(
          participant.userId,
          'CONTEST',
          'Contest Starting Soon',
          `The contest "${contest.title}" is starting in 15 minutes!`,
          `/contests/${contest.id}`
        );
      }
    }

    // Set upcoming to active
    await prisma.contest.updateMany({
      where: {
        status: ContestStatus.Upcoming,
        startTime: { lte: now },
      },
      data: { status: ContestStatus.Active },
    });

    // Find active contests that should be ended
    const endingContests = await prisma.contest.findMany({
      where: {
        status: ContestStatus.Active,
        endTime: { lte: now },
      },
      select: { id: true },
    });

    if (endingContests.length > 0) {
      const endingIds = endingContests.map((c) => c.id);

      // Set active to ended
      await prisma.contest.updateMany({
        where: { id: { in: endingIds } },
        data: { status: ContestStatus.Ended },
      });

      // Update ratings for all ended contests
      for (const contest of endingContests) {
        await RatingService.updateContestRatings(contest.id).catch(err => {
          console.error(`Failed to update ratings for contest ${contest.id}:`, err);
        });
      }
    }
    // Revisit ended contests after delayed grading finishes; finalization is idempotent.
    const unfinalized = await prisma.contest.findMany({ where: { status: 'Ended', participants: { some: { newRating: null } } }, select: { id: true }, take: 100 });
    for (const contest of unfinalized) await RatingService.updateContestRatings(contest.id);
  }

  async bulkRegister(contestId: string, participants: any[]) {
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new Error('Contest not found');

    const results = [];

    for (const p of participants) {
      if (!p.email || !p.password) continue;
      try {
        let user = await prisma.user.findUnique({ where: { email: p.email } });
        if (!user) {
          const passwordHash = await bcrypt.hash(p.password, 10);
          const username = p.email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
          user = await prisma.user.create({
            data: {
              email: p.email,
              username,
              passwordHash,
              role: 'STUDENT',
              isEmailVerified: true,
            },
          });
        }

        const existingParticipant = await prisma.contestParticipant.findFirst({
          where: { contestId, userId: user.id },
        });

        if (!existingParticipant) {
          await prisma.contestParticipant.create({
            data: { contestId, userId: user.id },
          });
        }
        results.push({ email: p.email, status: 'success' });
      } catch (err: any) {
        results.push({ email: p.email, status: 'error', error: err.message });
      }
    }

    return results;
  }
}

export default new ContestService();
