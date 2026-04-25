import prisma from '../config/database';
import { Solution } from '@prisma/client';

export class SolutionService {
  async createSolution(data: { problemId: string; authorId: string; title: string; content: string; language: string }): Promise<Solution> {
    return prisma.solution.create({
      data,
    });
  }

  async getSolutionsByProblem(problemId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [solutions, total] = await Promise.all([
      prisma.solution.findMany({
        where: { problemId },
        skip,
        take: limit,
        orderBy: { upvotes: 'desc' },
        include: {
          author: { select: { id: true, username: true, profilePicture: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.solution.count({ where: { problemId } }),
    ]);
    return { solutions, total };
  }

  async getSolutionById(id: string) {
    return prisma.solution.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, profilePicture: true } },
        comments: {
          include: { author: { select: { id: true, username: true, profilePicture: true } } },
          orderBy: { createdAt: 'desc' },
        },
        votes: true,
      },
    });
  }

  async updateSolution(id: string, authorId: string, data: { title?: string; content?: string; language?: string }) {
    const solution = await prisma.solution.findUnique({ where: { id } });
    if (!solution || solution.authorId !== authorId) throw new Error('Unauthorized or not found');
    return prisma.solution.update({
      where: { id },
      data,
    });
  }

  async deleteSolution(id: string, authorId: string, isAdmin: boolean) {
    const solution = await prisma.solution.findUnique({ where: { id } });
    if (!solution || (!isAdmin && solution.authorId !== authorId)) throw new Error('Unauthorized or not found');
    return prisma.solution.delete({ where: { id } });
  }
}

export default new SolutionService();
