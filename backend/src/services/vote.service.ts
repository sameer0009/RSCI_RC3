import prisma from '../config/database';

export class VoteService {
  async toggleVote(userId: string, solutionId: string, value: number) {
    // value must be 1 or -1
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_solutionId: { userId, solutionId },
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Removing vote
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await prisma.solution.update({
          where: { id: solutionId },
          data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
        });
        return { action: 'removed' };
      } else {
        // Changing vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        await prisma.solution.update({
          where: { id: solutionId },
          data: value === 1 
            ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
            : { downvotes: { increment: 1 }, upvotes: { decrement: 1 } },
        });
        return { action: 'changed' };
      }
    } else {
      // Adding new vote
      await prisma.vote.create({
        data: { userId, solutionId, value },
      });
      await prisma.solution.update({
        where: { id: solutionId },
        data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
      });
      return { action: 'added' };
    }
  }
}

export default new VoteService();
