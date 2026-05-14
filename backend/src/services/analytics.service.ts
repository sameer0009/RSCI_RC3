import prisma from '../config/database';

export class AnalyticsService {
  async getDashboardStats(days: number = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [
      totalUsers,
      totalProblems,
      totalSubmissions,
      totalContests,
      activeUsers,
      recentSubmissions,
      problemsByDifficulty,
      submissionsByVerdict,
      activeContests,
      activeClassrooms,
      usersByRole,
    ] = await Promise.all([
      // Total users (All roles)
      prisma.user.count(),

      // Total problems
      prisma.problem.count(),

      // Total submissions
      prisma.submission.count(),

      // Total contests
      prisma.contest.count(),

      // Active users (submitted in last 7 days)
      prisma.user.count({
        where: {
          submissions: {
            some: {
              submittedAt: {
                gte: startDate,
              },
            },
          },
        },
      }),

      // Recent submissions (last 10)
      prisma.submission.findMany({
        take: 10,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          problem: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      }),

      // Problems by difficulty
      prisma.problem.groupBy({
        by: ['difficulty'],
        _count: true,
      }),

      // Submissions by verdict
      prisma.submission.groupBy({
        by: ['verdict'],
        _count: true,
      }),

      // Active contests
      prisma.contest.count({
        where: {
          endTime: { gte: new Date() },
          startTime: { lte: new Date() },
        },
      }),

      // Active classrooms
      prisma.classroom.count(),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    // Calculate acceptance rate
    const acceptedSubmissions = await prisma.submission.count({
      where: { verdict: 'Accepted' },
    });
    const acceptanceRate =
      totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : '0.0';

    // Get top performers
    const topPerformers = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        username: true,
        problemsSolved: true,
        rating: true,
      },
      orderBy: [{ problemsSolved: 'desc' }, { rating: 'desc' }],
      take: 5,
    });

    // Submissions over time
    const submissionsOverTime = await this.getSubmissionsOverTime(days);

    return {
      overview: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalContests,
        activeUsers,
        acceptanceRate,
        activeContests,
        activeClassrooms,
      },
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      problemsByDifficulty: problemsByDifficulty.map((item) => ({
        difficulty: item.difficulty,
        count: item._count,
      })),
      submissionsByVerdict: submissionsByVerdict.map((item) => ({
        verdict: item.verdict,
        count: item._count,
      })),
      recentSubmissions: recentSubmissions.map((sub) => ({
        id: sub.id,
        username: sub.user.username,
        problemTitle: sub.problem.title,
        problemSlug: sub.problem.slug,
        language: sub.language,
        verdict: sub.verdict,
        submittedAt: sub.submittedAt,
      })),
      topPerformers,
      submissionsOverTime,
    };
  }

  async getSubmissionsOverTime(days: number) {
    const submissions = await prisma.submission.findMany({
      where: {
        submittedAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        submittedAt: true,
        verdict: true,
      },
    });

    // Group by date
    const grouped: Record<string, { total: number; accepted: number }> = {};

    submissions.forEach((sub) => {
      const date = sub.submittedAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { total: 0, accepted: 0 };
      }
      grouped[date].total++;
      if (sub.verdict === 'Accepted') {
        grouped[date].accepted++;
      }
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      total: data.total,
      accepted: data.accepted,
    }));
  }

  async getUserActivity(days: number = 30) {
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        submissions: {
          some: {
            submittedAt: {
              gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        _count: {
          select: {
            submissions: {
              where: {
                submittedAt: {
                  gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        },
      },
      orderBy: {
        submissions: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return users.map((user: any) => ({
      username: user.username,
      submissions: (user as any)._count.submissions,
    }));
  }

  /**
   * Get submission trend data for charts
   */
  async getSubmissionTrend(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const submissions = await prisma.submission.findMany({
      where: {
        submittedAt: { gte: startDate },
      },
      select: {
        submittedAt: true,
        verdict: true,
      },
    });

    // Create date map for all days
    const dateMap: Record<string, { date: string; total: number; accepted: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = { date: dateStr, total: 0, accepted: 0 };
    }

    // Fill in actual data
    submissions.forEach((sub) => {
      const dateStr = sub.submittedAt.toISOString().split('T')[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].total++;
        if (sub.verdict === 'Accepted') {
          dateMap[dateStr].accepted++;
        }
      }
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get difficulty distribution for pie chart
   */
  async getDifficultyDistribution() {
    const problems = await prisma.problem.groupBy({
      by: ['difficulty'],
      _count: true,
    });

    return problems.map((item) => ({
      difficulty: item.difficulty,
      count: item._count,
      percentage: 0, // Will be calculated on frontend
    }));
  }

  /**
   * Get language statistics for bar chart
   */
  async getLanguageStats() {
    const submissions = await prisma.submission.groupBy({
      by: ['language'],
      _count: true,
      orderBy: {
        _count: {
          language: 'desc',
        },
      },
      take: 10,
    });

    const total = submissions.reduce((sum, item) => sum + item._count, 0);

    return submissions.map((item) => ({
      language: item.language,
      count: item._count,
      percentage: ((item._count / total) * 100).toFixed(1),
    }));
  }

  /**
   * Get active users over time
   */
  async getActiveUsers(days: number = 30) {
    const dateMap: Record<string, Set<string>> = {};

    // Initialize date map
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = new Set();
    }

    // Get submissions
    const submissions = await prisma.submission.findMany({
      where: {
        submittedAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        userId: true,
        submittedAt: true,
      },
    });

    // Count unique users per day
    submissions.forEach((sub) => {
      const dateStr = sub.submittedAt.toISOString().split('T')[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].add(sub.userId);
      }
    });

    return Object.entries(dateMap)
      .map(([date, users]) => ({
        date,
        activeUsers: users.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Export analytics data as CSV
   */
  async exportAnalytics() {
    const stats = await this.getDashboardStats();

    // Create CSV content
    let csv = 'Analytics Report\n\n';
    csv += 'Overview\n';
    csv += `Total Users,${stats.overview.totalUsers}\n`;
    csv += `Total Problems,${stats.overview.totalProblems}\n`;
    csv += `Total Submissions,${stats.overview.totalSubmissions}\n`;
    csv += `Acceptance Rate,${stats.overview.acceptanceRate}%\n\n`;

    csv += 'Problems by Difficulty\n';
    csv += 'Difficulty,Count\n';
    stats.problemsByDifficulty.forEach((item) => {
      csv += `${item.difficulty},${item.count}\n`;
    });

    csv += '\nSubmissions by Verdict\n';
    csv += 'Verdict,Count\n';
    stats.submissionsByVerdict.forEach((item) => {
      csv += `${item.verdict},${item.count}\n`;
    });

    return csv;
  }
}

export default new AnalyticsService();
