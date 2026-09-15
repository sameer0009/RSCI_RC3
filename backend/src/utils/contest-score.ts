import { Submission } from '@prisma/client';

export function contestScore(submissions: Array<Pick<Submission, 'id' | 'problemId' | 'verdict' | 'submittedAt'>>, start: Date, points: Map<string, number>) {
  const solved = new Set<string>();
  const wrong = new Map<string, number>();
  let totalPoints = 0, penalty = 0;
  let lastSubmissionTime: Date | null = null;
  for (const sub of [...submissions].sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime() || a.id.localeCompare(b.id))) {
    if (solved.has(sub.problemId) || !points.has(sub.problemId)) continue;
    if (sub.verdict === 'Accepted') {
      solved.add(sub.problemId);
      totalPoints += points.get(sub.problemId)!;
      penalty += Math.max(0, Math.floor((sub.submittedAt.getTime() - start.getTime()) / 60000)) + (wrong.get(sub.problemId) || 0) * 20;
      lastSubmissionTime = sub.submittedAt;
    } else if (['WrongAnswer', 'TimeLimitExceeded', 'RuntimeError'].includes(sub.verdict)) {
      wrong.set(sub.problemId, (wrong.get(sub.problemId) || 0) + 1);
    }
  }
  return { totalPoints, penalty, problemsSolved: solved.size, lastSubmissionTime };
}
