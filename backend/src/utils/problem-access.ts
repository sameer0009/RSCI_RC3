import { Prisma } from '@prisma/client';

export function visibleProblems(user?: { id: string; role: string }): Prisma.ProblemWhereInput {
  if (user?.role === 'ADMIN') return {};
  const published: Prisma.ProblemWhereInput[] = [{ isGlobal: true }];
  if (user) {
    published.push(
      { assignments: { some: { classroom: { OR: [{ instructorId: user.id }, { members: { some: { userId: user.id } } }] } } } },
      { contests: { some: { startTime: { lte: new Date() }, participants: { some: { userId: user.id } } } } }
    );
  }
  return { OR: [
    ...(user ? [{ createdBy: user.id }] : []),
    { status: 'PUBLISHED', OR: published },
  ] };
}
