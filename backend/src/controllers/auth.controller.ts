import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import authService from '../services/auth.service';
import { emailQueue } from '../queues/email.queue';

export class AuthController {
  register = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { username, email, password, role } = req.body;

      const { user, tokens } = await authService.register({
        username,
        email,
        password,
        role: role as any
      });

      const verificationToken = await authService.createVerificationToken(user.id);
      
      // Queue verification email
      await emailQueue.add('welcome', {
        to: user.email,
        subject: 'Welcome to RSCI-RC3!',
        templateName: 'welcome',
        context: {
          username: user.username,
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`
        }
      });

      this.setAuthCookies(res, tokens);

      res.status(201).json({
        success: true,
        data: { user, tokens },
        message: 'Registration successful. Please verify your email.',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message || 'Registration failed',
        },
      });
    }
  }

  login = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { email, password } = req.body;

      const { user, tokens } = await authService.login({ email, password });

      this.setAuthCookies(res, tokens);

      res.json({
        success: true,
        data: { user, tokens },
        message: 'Login successful',
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message || 'Invalid credentials',
        },
      });
    }
  }

  private setAuthCookies = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  refresh = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'Refresh token not provided',
          },
        });
      }

      const tokens = await authService.refreshTokens(refreshToken);
      this.setAuthCookies(res, tokens);

      res.json({
        success: true,
        data: { tokens },
        message: 'Tokens refreshed successfully',
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: error.message || 'Token refresh failed',
        },
      });
    }
  }

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      await authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: error.message || 'Email verification failed',
        },
      });
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const token = await authService.createPasswordResetToken(email);

      if (token) {
        await emailQueue.add('forgotPassword', {
          to: email,
          subject: 'Password Reset Request',
          templateName: 'resetPassword', // Need to create this template
          context: {
            resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`
          }
        });
        console.log(`Password reset token for ${email}: ${token}`);
      }

      // Always return success for security
      res.json({
        success: true,
        message: 'If an account exists, a password reset email has been sent.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FORGOT_PASSWORD_FAILED',
          message: 'An error occurred while processing your request',
        },
      });
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'RESET_PASSWORD_FAILED',
          message: error.message || 'Password reset failed',
        },
      });
    }
  }

  getMe = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user',
        },
      });
    }
  }

  logout = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed',
        },
      });
    }
  }

  // OAuth Placeholders - will be implemented with Passport or specific providers
  googleAuth(req: Request, res: Response) {
    // Redirect to Google
  }

  googleCallback(req: Request, res: Response) {
    // Handle Google callback
  }

  githubAuth(req: Request, res: Response) {
    // Redirect to GitHub
  }

  oauthCallback = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
      }

      const tokens = await authService.issueTokens(user);
      this.setAuthCookies(res, tokens);

      // Redirect to frontend dashboard or home
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=internal_error`);
    }
  }
}

export default new AuthController();
