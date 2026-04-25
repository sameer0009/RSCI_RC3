import prisma from '../config/database';
import { Comment } from '@prisma/client';

export class CommentService {
  async createComment(data: { solutionId: string; authorId: string; content: string }): Promise<Comment> {
    const comment = await prisma.comment.create({
      data,
      include: {
        author: { select: { id: true, username: true, profilePicture: true } },
      },
    });

    const solution = await prisma.solution.findUnique({
      where: { id: data.solutionId },
      select: { authorId: true, title: true, problemId: true }
    });

    if (solution && solution.authorId !== data.authorId) {
      const notificationService = require('./notification.service').default;
      await notificationService.createNotification(
        solution.authorId,
        'COMMUNITY',
        'New Comment on your Solution',
        `Someone commented on your solution: "${solution.title}"`,
        `/problems/${solution.problemId}`
      );
    }

    return comment;
  }

  async getCommentsBySolution(solutionId: string) {
    return prisma.comment.findMany({
      where: { solutionId },
      include: {
        author: { select: { id: true, username: true, profilePicture: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteComment(id: string, authorId: string, isAdmin: boolean) {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment || (!isAdmin && comment.authorId !== authorId)) throw new Error('Unauthorized or not found');
    return prisma.comment.delete({ where: { id } });
  }
}

export default new CommentService();
