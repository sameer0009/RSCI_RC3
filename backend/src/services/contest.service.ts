import prisma from '../config/database';
import { ContestStatus } from '@prisma/client';
import { RatingService } from './rating.service';

class ContestService {
  async createContest(data: any) {
    const { problemIds, ...contestData } = data;
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
    return prisma.contest.findUnique({
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
  }

  async registerUser(contestId: string, userId: string) {
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new Error('Contest not found');
    if (contest.startTime < new Date()) throw new Error('Contest already started');

    return prisma.contestParticipant.create({
      data: {
        contestId,
        userId,
      },
    });
  }

  async getContests(page: number = 1, limit: number = 20, status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
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

    return {
      contests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getLeaderboard(contestId: string) {
    // Hide updates in last N minutes logic can be implemented by checking freeze time
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new Error('Contest not found');

    const participants = await prisma.contestParticipant.findMany({
      where: { contestId },
      include: { user: { select: { username: true, rating: true, id: true } } },
      orderBy: [
        { problemsSolved: 'desc' },
        { penalty: 'asc' },
      ],
    });

    return participants;
  }

  async getContestProblems(contestId: string, userId: string, isAdmin: boolean) {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: { problems: true },
    });

    if (!contest) throw new Error('Contest not found');

    if (!isAdmin && contest.status === 'Upcoming') {
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
      ...originalContest,
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
  }
}

export default new ContestService();
