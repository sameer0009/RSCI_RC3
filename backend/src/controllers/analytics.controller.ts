import { Request, Response } from 'express';
import analyticsService from '../services/analytics.service';

export class AnalyticsController {
  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const stats = await analyticsService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_STATS_FAILED',
          message: error.message || 'Failed to fetch dashboard stats',
        },
      });
    }
  }

  getUserActivity = async (req: Request, res: Response) => {
    try {
      const { days = '30' } = req.query;
      const activity = await analyticsService.getUserActivity(parseInt(days as string));

      res.json({
        success: true,
        data: activity,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_ACTIVITY_FAILED',
          message: error.message || 'Failed to fetch user activity',
        },
      });
    }
  }

  getSubmissionTrend = async (req: Request, res: Response) => {
    try {
      const { days = '30' } = req.query;
      const trend = await analyticsService.getSubmissionTrend(parseInt(days as string));

      res.json({
        success: true,
        data: trend,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_TREND_FAILED',
          message: error.message || 'Failed to fetch submission trend',
        },
      });
    }
  }

  getDifficultyDistribution = async (req: Request, res: Response) => {
    try {
      const distribution = await analyticsService.getDifficultyDistribution();

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DISTRIBUTION_FAILED',
          message: error.message || 'Failed to fetch difficulty distribution',
        },
      });
    }
  }

  getLanguageStats = async (req: Request, res: Response) => {
    try {
      const stats = await analyticsService.getLanguageStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_LANGUAGE_STATS_FAILED',
          message: error.message || 'Failed to fetch language statistics',
        },
      });
    }
  }

  getActiveUsers = async (req: Request, res: Response) => {
    try {
      const { days = '30' } = req.query;
      const activeUsers = await analyticsService.getActiveUsers(parseInt(days as string));

      res.json({
        success: true,
        data: activeUsers,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_ACTIVE_USERS_FAILED',
          message: error.message || 'Failed to fetch active users',
        },
      });
    }
  }

  exportAnalytics = async (req: Request, res: Response) => {
    try {
      const csv = await analyticsService.exportAnalytics();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: error.message || 'Failed to export analytics',
        },
      });
    }
  }
}

export default new AnalyticsController();
