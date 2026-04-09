import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    try {
      const participants = await prisma.contestParticipant.findMany({
        where: { contestId },
        include: { user: true },
        orderBy: { rank: 'asc' },
      });

      if (participants.length < 2) return; // Need at least 2 people to measure Elo

      const results: ParticipantResult[] = participants.map((p) => ({
        userId: p.userId,
        rank: p.rank,
        oldRating: p.user.rating || 1200, // Default rating
      }));

      // Calculate new ratings
      const newRatings = this.calculateNewRatings(results);

      // Perform updates
      const updatePromises = participants.map((participant) => {
        const newRatingData = newRatings.find((r) => r.userId === participant.userId);
        if (!newRatingData) return Promise.resolve();

        return prisma.user.update({
          where: { id: participant.userId },
          data: {
            rating: Math.floor(newRatingData.newRating),
          },
        });
      });

      await Promise.all(updatePromises);
      
      console.log(`Successfully updated ratings for contest ${contestId}`);
    } catch (error) {
      console.error('Error updating contest ratings:', error);
      throw error;
    }
  }

  /**
   * Compare all pairs of participants to adjust Elo based on ranks
   */
  private static calculateNewRatings(results: ParticipantResult[]): Array<ParticipantResult & { newRating: number }> {
    const updated = results.map(r => ({ ...r, newRating: r.oldRating }));

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
