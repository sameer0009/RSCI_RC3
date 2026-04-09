import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { User, Role, TokenType } from '@prisma/client';
import crypto from 'crypto';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_REFRESH_SECRET: string =
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  private readonly SALT_ROUNDS = 10;

  async register(
    data: RegisterData
  ): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    const { username, email, password, role = Role.STUDENT } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        notificationSetting: {
          create: {}, // Create default settings
        },
      },
    });

    // Generate tokens
    const tokens = await this.issueTokens(user);

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async login(data: LoginData): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.issueTokens(user);

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  /**
   * Generates JWTs and persists the refresh token to the database
   */
  async issueTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN as string,
    } as jwt.SignOptions);

    // Persist refresh token (one active per user for simplicity, or multi-device support)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Matches 7d

    await prisma.authToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        type: TokenType.REFRESH,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // 1. Verify JWT signature
    const payload = this.verifyRefreshToken(refreshToken);

    // 2. Check database for valid, non-expired token
    const storedToken = await prisma.authToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.type !== TokenType.REFRESH ||
      storedToken.expiresAt < new Date()
    ) {
      if (storedToken) {
        await prisma.authToken.delete({ where: { id: storedToken.id } });
      }
      throw new Error('Invalid or expired refresh token session');
    }

    // 3. User still exists?
    const user = storedToken.user;
    if (!user) throw new Error('User not found');

    // 4. Invalidate old token and issue new ones (Token Rotation)
    await prisma.authToken.delete({ where: { id: storedToken.id } });

    return this.issueTokens(user);
  }

  async createVerificationToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    await prisma.authToken.create({
      data: {
        userId,
        token,
        type: TokenType.VERIFICATION,
        expiresAt,
      },
    });

    return token;
  }

  async verifyEmail(token: string): Promise<void> {
    const storedToken = await prisma.authToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.type !== TokenType.VERIFICATION ||
      storedToken.expiresAt < new Date()
    ) {
      throw new Error('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: storedToken.userId },
      data: { isEmailVerified: true },
    });

    await prisma.authToken.delete({ where: { id: storedToken.id } });
  }

  async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await prisma.authToken.create({
      data: {
        userId: user.id,
        token,
        type: TokenType.PASSWORD_RESET,
        expiresAt,
      },
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const storedToken = await prisma.authToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.type !== TokenType.PASSWORD_RESET ||
      storedToken.expiresAt < new Date()
    ) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: storedToken.userId },
      data: { passwordHash },
    });

    // Revoke all existing sessions for safety after password reset
    await prisma.authToken.deleteMany({
      where: { userId: storedToken.userId },
    });
  }

  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.authToken.deleteMany({
      where: { token: refreshToken, type: TokenType.REFRESH },
    });
  }
}

export default new AuthService();
