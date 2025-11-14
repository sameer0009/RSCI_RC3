import prisma from '../config/database';
import redisClient from '../config/redis';

export class LeaderboardService {
  private readonly CACHE_TTL = 60; // 60 seconds

  async getGlobalLeaderboard(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'USER',
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
        where: { role: 'USER' },
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
        role: 'USER',
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
