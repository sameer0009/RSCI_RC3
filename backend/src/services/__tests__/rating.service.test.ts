import { RatingService } from '../rating.service';

describe('RatingService', () => {
  describe('calculateNewRatings', () => {
    it('should correctly update ratings for two players', () => {
      const participants = [
        { userId: 'u1', rank: 1, oldRating: 1500 },
        { userId: 'u2', rank: 2, oldRating: 1500 },
      ];

      const results = (RatingService as any).calculateNewRatings(participants);

      expect(results[0].newRating).toBeGreaterThan(1500);
      expect(results[1].newRating).toBeLessThan(1500);
      // Sum of ratings should be roughly conserved (small floating point errors)
      expect(results[0].newRating + results[1].newRating).toBeCloseTo(3000);
    });

    it('should update ratings correctly when low rated player beats high rated player', () => {
      const participants = [
        { userId: 'u1', rank: 1, oldRating: 1200 }, // Underdog wins
        { userId: 'u2', rank: 2, oldRating: 1800 },
      ];

      const results = (RatingService as any).calculateNewRatings(participants);

      // Underdog should gain significant points
      const gain = results[0].newRating - 1200;
      const loss = 1800 - results[1].newRating;
      
      expect(gain).toBeGreaterThan(16); // Since K=32 and expected win was very low
      expect(results[0].newRating).toBeGreaterThan(1216);
    });

    it('should handle multi-player rankings', () => {
      const participants = [
        { userId: 'u1', rank: 1, oldRating: 1500 },
        { userId: 'u2', rank: 2, oldRating: 1500 },
        { userId: 'u3', rank: 3, oldRating: 1500 },
      ];

      const results = (RatingService as any).calculateNewRatings(participants);

      expect(results[0].newRating).toBeGreaterThan(results[1].newRating);
      expect(results[1].newRating).toBeGreaterThan(results[2].newRating);
    });
  });
});
