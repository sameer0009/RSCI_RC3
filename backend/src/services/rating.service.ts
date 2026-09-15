import { contestScore } from '../utils/contest-score';
import prisma from '../config/database';

interface ParticipantResult {
  userId: string;
  rank: number;
  oldRating: number;
}

/**
 * Standard implementation of a simple ELO rating system.
 * Expected to run at the end of a contest.
 */
export class RatingService {
  private static readonly K_FACTOR = 32;

  /**
   * Updates ratings for all users in a contest according to their final ranking
   */
  public static async updateContestRatings(contestId: string): Promise<void> {
    await prisma.$transaction(async tx => {
      // Serialize finalization and commit every user's rating in one transaction.
      await tx.contest.update({ where: { id: contestId }, data: { status: 'Ended' } });
      const contest = await tx.contest.findUnique({ where: { id: contestId }, include: { problems: { select: { id: true, points: true } } } });
      if (!contest || contest.endTime > new Date()) return;
      const participants = await tx.contestParticipant.findMany({ where: { contestId }, include: { user: true } });
      if (participants.some(p => p.newRating !== null)) return;
      const submissions = await tx.submission.findMany({ where: { contestId, submittedAt: { gte: contest.startTime, lt: contest.endTime } } });
      if (submissions.some(s => s.verdict === 'Pending')) return;
      const points = new Map(contest.problems.map(p => [p.id, p.points]));
      const board = participants.map(p => ({ ...p, ...contestScore(submissions.filter(s => s.userId === p.userId), contest.startTime, points) })).sort((a, b) => b.problemsSolved - a.problemsSolved || a.penalty - b.penalty);
      let rank = 0;
      const ranked = board.map((p, i) => {
        if (!i || p.problemsSolved !== board[i - 1].problemsSolved || p.penalty !== board[i - 1].penalty) rank = i + 1;
        return { userId: p.userId, rank, oldRating: p.user.rating || 1200 };
      });
      const ratings = this.calculateNewRatings(ranked);
      for (const participant of board) {
        const result = ratings.find(r => r.userId === participant.userId)!;
        await tx.user.update({ where: { id: participant.userId }, data: { rating: Math.floor(result.newRating) } });
        await tx.contestParticipant.update({ where: { id: participant.id }, data: { rank: result.rank, oldRating: result.oldRating, newRating: Math.floor(result.newRating), totalPoints: participant.totalPoints, problemsSolved: participant.problemsSolved, penalty: participant.penalty, lastSubmissionTime: participant.lastSubmissionTime } });
      }
    }, { timeout: 30000 });
  }

  /**
   * Compare all pairs of participants to adjust Elo based on ranks
   */
  private static calculateNewRatings(
    results: ParticipantResult[]
  ): Array<ParticipantResult & { newRating: number }> {
    const updated = results.map((r) => ({ ...r, newRating: r.oldRating }));

    for (let i = 0; i < updated.length; i++) {
      for (let j = i + 1; j < updated.length; j++) {
        const p1 = updated[i];
        const p2 = updated[j];

        // Probability of p1 beating p2
        const expectedScore1 = 1 / (1 + Math.pow(10, (p2.oldRating - p1.oldRating) / 400));
        const expectedScore2 = 1 - expectedScore1;

        // Actual score based on rank (1 if won, 0 if lost, 0.5 if tie)
        let s1 = 0.5;
        let s2 = 0.5;
        if (p1.rank < p2.rank) {
          s1 = 1;
          s2 = 0;
        } else if (p1.rank > p2.rank) {
          s1 = 0;
          s2 = 1;
        }

        // Elo formula adjustment
        const delta1 = this.K_FACTOR * (s1 - expectedScore1);
        const delta2 = this.K_FACTOR * (s2 - expectedScore2);

        // Accumulate increments
        p1.newRating += delta1 / (updated.length - 1);
        p2.newRating += delta2 / (updated.length - 1);
      }
    }

    return updated;
  }
}
