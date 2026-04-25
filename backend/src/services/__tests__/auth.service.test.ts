import authService from '../auth.service';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';

jest.mock('../../config/database', () => ({
  user: {
    findUnique: jest.fn(),
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

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
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

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-id' });

      await expect(authService.register(userData as any)).rejects.toThrow('User with this email or username already exists');
    });
  });
});
