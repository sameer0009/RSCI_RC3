import prisma from '../config/database';
import { NotificationType } from '@prisma/client';
import { io } from '../index';

class NotificationService {
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link,
        },
      });

      // Emit real-time update via Socket.io
      // We assume users join a room named after their userId
      io.to(userId).emit('notification', notification);

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  async getNotifications(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteOldNotifications(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return prisma.notification.deleteMany({
      where: {
        createdAt: { lt: date },
      },
    });
  }
}

export default new NotificationService();
