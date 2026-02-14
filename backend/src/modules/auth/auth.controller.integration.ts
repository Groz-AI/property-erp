import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService, TokenResponse } from './auth.service';

const mockTokenResponse: TokenResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 900,
  user: {
    id: 'usr-001',
    email: 'admin@acme.com',
    firstName: 'John',
    lastName: 'Doe',
    tenantId: 'tenant-001',
    isSystemAdmin: false,
  },
};

const mockAuthService = {
  login: jest.fn().mockResolvedValue(mockTokenResponse),
  register: jest.fn().mockResolvedValue(mockTokenResponse),
  refreshTokens: jest.fn().mockResolvedValue({
    accessToken: 'new-access',
    refreshToken: 'new-refresh',
    expiresIn: 900,
  }),
  logout: jest.fn().mockResolvedValue(undefined),
};

describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return tokens on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@acme.com', password: 'securePass123!' })
        .expect(200);

      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('admin@acme.com');
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'securePass123!' })
        .expect(400);
    });

    it('should reject short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@acme.com', password: 'short' })
        .expect(400);
    });

    it('should reject missing body', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@acme.com',
          password: 'securePass123!',
          firstName: 'Jane',
          lastName: 'Smith',
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('accessToken');
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });

    it('should reject registration with missing firstName', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@acme.com',
          password: 'securePass123!',
          lastName: 'Smith',
        })
        .expect(400);
    });

    it('should reject registration with short firstName', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@acme.com',
          password: 'securePass123!',
          firstName: 'J',
          lastName: 'Smith',
        })
        .expect(400);
    });
  });
});
