import { contestScore } from '../../utils/contest-score';
const start = new Date('2026-01-01T00:00:00Z');
const sub = (id: string, minute: number, verdict: any, problemId = 'p') => ({ id, problemId, verdict, submittedAt: new Date(start.getTime() + minute * 60000) });
test('counts one solve and only wrong attempts before first acceptance', () => {
 const score = contestScore([sub('a', 1, 'CompilationError'), sub('b', 2, 'WrongAnswer'), sub('c', 5, 'Accepted'), sub('d', 8, 'Accepted'), sub('e', 9, 'WrongAnswer')], start, new Map([['p', 150]]));
 expect(score).toMatchObject({ totalPoints: 150, problemsSolved: 1, penalty: 25 });
});
test('out-of-order grading yields the same totals and ignores unrelated problems', () => {
 const submissions = [sub('c', 5, 'Accepted'), sub('b', 2, 'WrongAnswer'), sub('a', 1, 'Accepted', 'foreign')];
 expect(contestScore(submissions, start, new Map([['p', 100]]))).toMatchObject({ totalPoints: 100, problemsSolved: 1, penalty: 25 });
});
