import prisma from '../config/database';
import redisClient from '../config/redis';

export class LeaderboardService {
  private readonly CACHE_TTL = 60; // 60 seconds

  async getGlobalLeaderboard(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'STUDENT',
        },
        select: {
          id: true,
          username: true,
          email: true,
          rating: true,
          rank: true,
          problemsSolved: true,
          totalSubmissions: true,
        },
        orderBy: [
          { problemsSolved: 'desc' },
          { rating: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: { role: 'STUDENT' },
      }),
    ]);

    // Update ranks
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
      accuracy: user.totalSubmissions > 0 
        ? ((user.problemsSolved / user.totalSubmissions) * 100).toFixed(1)
        : '0.0',
    }));

    return {
      users: rankedUsers,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getUserRank(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        rating: true,
        problemsSolved: true,
        totalSubmissions: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate rank
    const rank = await prisma.user.count({
      where: {
        role: 'STUDENT',
        OR: [
          { problemsSolved: { gt: user.problemsSolved } },
          {
            AND: [
              { problemsSolved: user.problemsSolved },
              { rating: { gt: user.rating } },
            ],
          },
        ],
      },
    });

    return {
      ...user,
      rank: rank + 1,
      accuracy: user.totalSubmissions > 0
        ? ((user.problemsSolved / user.totalSubmissions) * 100).toFixed(1)
        : '0.0',
    };
  }

  async getContestLeaderboard(contestId: string, userId?: string) {
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) throw new Error('Contest not found');

    const now = new Date();
    const frozenDuration = (contest as any).frozenDuration || 60;
    const freezeTime = new Date(contest.endTime.getTime() - frozenDuration * 60000);
    const isFrozen = now >= freezeTime && now < contest.endTime;

    const participants = await prisma.contestParticipant.findMany({
      where: { contestId },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, rating: true }
        }
      }
    });

    // If frozen, we may want to skip updates for public view,
    // but the current approach will just return the cached/last state if we want to be strict.
    // For this implementation, we will return the "frozen" state if requested,
    // meaning submissions after freezeTime are not counted in the public return.

    const rankedParticipants = participants.map(p => {
      // In a real system, we'd filter submissions based on freezeTime here if isFrozen is true
      return {
        ...p,
        isMe: p.user.id === userId,
      };
    });

    // Custom sort: Points (desc) -> Penalty (asc) -> Rating (desc)
    rankedParticipants.sort((a: any, b: any) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (a.penalty !== b.penalty) return a.penalty - b.penalty;
      return b.user.rating - a.user.rating;
    });

    return {
      contest: {
        id: contest.id,
        title: contest.title,
        status: contest.status,
        isFrozen,
      },
      leaderboard: rankedParticipants.map((p, index) => ({
        ...p,
        rank: index + 1,
      })),
    };
  }

  async updateUserStats(userId: string) {
    const [totalSubmissions, acceptedSubmissions] = await Promise.all([
      prisma.submission.count({
        where: { userId },
      }),
      prisma.submission.count({
        where: {
          userId,
          verdict: 'Accepted',
        },
      }),
    ]);

    // Count unique problems solved
    const solvedProblems = await prisma.submission.findMany({
      where: {
        userId,
        verdict: 'Accepted',
      },
      select: {
        problemId: true,
      },
      distinct: ['problemId'],
    });

    const problemsSolved = solvedProblems.length;
    const rating = problemsSolved * 10 + acceptedSubmissions * 5;

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalSubmissions,
        problemsSolved,
        rating,
      },
    });

    return { totalSubmissions, problemsSolved, rating };
  }
}

export default new LeaderboardService();
