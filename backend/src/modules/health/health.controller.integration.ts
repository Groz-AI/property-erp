import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from './health.controller';

describe('HealthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health should return healthy status', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);

    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
  });
});
