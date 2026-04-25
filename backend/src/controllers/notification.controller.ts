import { Request, Response } from 'express';
import notificationService from '../services/notification.service';

export class NotificationController {
  getNotifications = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const notifications = await notificationService.getNotifications(userId);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'NOTIFICATIONS_FETCH_FAILED', message: 'Failed to fetch notifications' },
      });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'MARK_READ_FAILED', message: 'Failed to mark notification as read' },
      });
    }
  };

  markAllAsRead = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'MARK_ALL_READ_FAILED',
          message: 'Failed to mark all notifications as read',
        },
      });
    }
  };
  getSettings = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const settings = await notificationService.getSettings(userId);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'SETTINGS_FETCH_FAILED', message: 'Failed to fetch settings' } });
    }
  };

  updateSettings = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { emailNotifications, pushNotifications, contestReminders, marketingEmails } = req.body;
      const settings = await notificationService.updateSettings(userId, {
        emailNotifications, pushNotifications, contestReminders, marketingEmails
      });
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'SETTINGS_UPDATE_FAILED', message: 'Failed to update settings' } });
    }
  };
}

export default new NotificationController();
