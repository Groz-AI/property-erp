import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let signAsyncMock: jest.Mock;

  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('Password123!', 10);
  });

  const makeMockUser = (overrides: Record<string, any> = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    passwordHash,
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'tenant-1',
    isSystemAdmin: false,
    isActive: true,
    failedLoginCount: 0,
    lockedUntil: null,
    refreshTokenHash: null,
    lastLoginAt: null,
    lastLoginIp: null,
    ...overrides,
  });

  beforeEach(() => {
    findOneMock = jest.fn();
    saveMock = jest.fn().mockImplementation((entity: any) => Promise.resolve(entity));
    createMock = jest.fn().mockImplementation((data: any) => ({ ...data, id: 'new-user-1' }));
    updateMock = jest.fn().mockResolvedValue({ affected: 1 });

    signAsyncMock = jest.fn()
      .mockResolvedValueOnce('mock-access-token')
      .mockResolvedValueOnce('mock-refresh-token');

    const userRepo = { findOne: findOneMock, save: saveMock, create: createMock, update: updateMock };
    const jwtService = { signAsync: signAsyncMock, verify: jest.fn() };
    const configService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
        const c: Record<string, string> = { JWT_SECRET: 's', JWT_REFRESH_SECRET: 'rs', JWT_EXPIRY: '900', JWT_REFRESH_EXPIRY: '604800' };
        return c[key] || defaultValue;
      }),
    };

    service = new AuthService(userRepo as any, jwtService as any, configService as any);
  });

  describe('login', () => {
    it('should return tokens and user data for valid credentials', async () => {
      findOneMock.mockResolvedValue(makeMockUser());

      const result = await service.login({ email: 'test@example.com', password: 'Password123!' }, '127.0.0.1');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.id).toBe('user-1');
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      findOneMock.mockResolvedValue(makeMockUser());

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      findOneMock.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@example.com', password: 'Password123!' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      findOneMock.mockResolvedValue(makeMockUser({ isActive: false }));

      await expect(
        service.login({ email: 'test@example.com', password: 'Password123!' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      findOneMock.mockResolvedValue(makeMockUser({
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
      }));

      await expect(
        service.login({ email: 'test@example.com', password: 'Password123!' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should increment failedLoginCount on wrong password', async () => {
      findOneMock.mockResolvedValue(makeMockUser({ failedLoginCount: 0 }));

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(saveMock).toHaveBeenCalledWith(
        expect.objectContaining({ failedLoginCount: 1 }),
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      findOneMock.mockResolvedValue(makeMockUser({ failedLoginCount: 4 }));

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(saveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          failedLoginCount: 5,
          lockedUntil: expect.any(Date),
        }),
      );
    });

    it('should reset failedLoginCount on successful login', async () => {
      const user = makeMockUser({ failedLoginCount: 3 });
      findOneMock.mockResolvedValue(user);

      await service.login({ email: 'test@example.com', password: 'Password123!' }, '127.0.0.1');

      expect(user.failedLoginCount).toBe(0);
      expect(user.lockedUntil).toBeNull();
    });

    it('should update lastLoginAt and lastLoginIp', async () => {
      const user = makeMockUser();
      findOneMock.mockResolvedValue(user);

      await service.login({ email: 'test@example.com', password: 'Password123!' }, '192.168.1.1');

      expect(user.lastLoginAt).toBeInstanceOf(Date);
      expect(user.lastLoginIp).toBe('192.168.1.1');
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      findOneMock.mockResolvedValue(makeMockUser());

      await expect(
        service.register({ email: 'test@example.com', password: 'NewPass123!', firstName: 'New', lastName: 'User' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens for new email', async () => {
      findOneMock.mockResolvedValue(null);
      signAsyncMock.mockReset();
      signAsyncMock
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.register({
        email: 'new@example.com',
        password: 'NewPass123!',
        firstName: 'New',
        lastName: 'User',
      });

      expect(result.accessToken).toBe('new-access-token');
      expect(createMock).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear refreshTokenHash', async () => {
      await service.logout('user-1');

      expect(updateMock).toHaveBeenCalledWith('user-1', { refreshTokenHash: null });
    });
  });

  describe('validateUser', () => {
    it('should return user for valid active user', async () => {
      findOneMock.mockResolvedValue(makeMockUser());

      const result = await service.validateUser({
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        isSystemAdmin: false,
      });

      expect(result).toBeDefined();
      expect(result!.id).toBe('user-1');
    });

    it('should return null for non-existent user', async () => {
      findOneMock.mockResolvedValue(null);

      const result = await service.validateUser({
        sub: 'non-existent',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        isSystemAdmin: false,
      });

      expect(result).toBeNull();
    });
  });
});
