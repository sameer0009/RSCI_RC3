import authService from '../auth.service';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';

jest.mock('../../config/database', () => ({
  authToken: { create: jest.fn() },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        ...userData,
        passwordHash: 'hashedPassword',
        role: 'STUDENT',
      });

      const result = await authService.register(userData as any);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.username).toBe(userData.username);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        username: 'existing',
        email: 'test@example.com',
        password: 'Password123',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-id', email: 'test@example.com' });

      await expect(authService.register(userData as any)).rejects.toThrow('Email already registered');
    });
  });
});

test('refresh tokens are unique even when issued in the same second', async () => {
 const user = { id: 'u', email: 'u@example.com', role: 'STUDENT' } as any;
 const first = await authService.issueTokens(user), second = await authService.issueTokens(user);
 expect(first.refreshToken).not.toBe(second.refreshToken);
});
