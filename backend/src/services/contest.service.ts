import prisma from '../config/database';
import { ContestStatus } from '@prisma/client';

class ContestService {
  async createContest(data: any) {
    return prisma.contest.create({
      data,
    });
  }

  async getContest(id: string) {
    return prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
          select: { id: true, title: true, difficulty: true }
        },
        _count: {
          select: { participants: true }
        }
      }
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

  async getActiveContests() {
    return prisma.contest.findMany({
      where: {
        status: ContestStatus.Active,
      },
      include: {
        _count: { select: { participants: true } }
      }
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
    if (originalContest.endTime > new Date()) throw new Error('Contest is still ongoing. Only past contests can be taken virtually.');

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
    
    // Set upcoming to active
    await prisma.contest.updateMany({
      where: {
        status: ContestStatus.Upcoming,
        startTime: { lte: now },
      },
      data: { status: ContestStatus.Active },
    });

    // Set active to ended
    await prisma.contest.updateMany({
      where: {
        status: ContestStatus.Active,
        endTime: { lte: now },
      },
      data: { status: ContestStatus.Ended },
    });
  }
}

export default new ContestService();
