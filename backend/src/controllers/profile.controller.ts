import { Request, Response } from 'express';
import profileService from '../services/profile.service';

class ProfileController {
  /**
   * Get public profile
   * GET /api/users/:username/profile
   */
  getProfile = async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const profile = await profileService.getProfile(username);

      res.json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: error.message || 'Profile not found'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update own profile
   * PUT /api/users/profile
   */
  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { fullName, bio, location } = req.body;

      const profile = await profileService.updateProfile(userId, {
        fullName,
        bio,
        location
      });

      res.json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error.message || 'Failed to update profile'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Upload profile picture
   * POST /api/users/profile/picture
   */
  uploadProfilePicture = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded'
          },
          timestamp: new Date().toISOString()
        });
      }

      const result = await profileService.uploadProfilePicture(userId, file);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error.message || 'Failed to upload profile picture'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete profile picture
   * DELETE /api/users/profile/picture
   */
  deleteProfilePicture = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const result = await profileService.deleteProfilePicture(userId);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error.message || 'Failed to delete profile picture'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update social links
   * PUT /api/users/profile/social
   */
  updateSocialLinks = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { linkedinUrl, githubUrl, twitterUrl, websiteUrl } = req.body;

      const result = await profileService.updateSocialLinks(userId, {
        linkedinUrl,
        githubUrl,
        twitterUrl,
        websiteUrl
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error.message || 'Failed to update social links'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new ProfileController();
