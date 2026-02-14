import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { BookingsController } from './bookings.controller';
import { BookingService } from './services/booking.service';
import { BookingStatus, BookingFeeType } from '../../shared/enums';

const mockBooking = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  bookingNumber: 'BK-2026-0001',
  customerId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  unitId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  projectId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  netPrice: 2700000,
  bookingFee: 100000,
  status: BookingStatus.ACTIVE,
  tenantId: 'tenant-001',
};

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockBooking]),
  findOne: jest.fn().mockResolvedValue(mockBooking),
  create: jest.fn().mockResolvedValue(mockBooking),
  cancel: jest.fn().mockResolvedValue({ ...mockBooking, status: BookingStatus.CANCELLED }),
};

describe('BookingsController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/bookings', () => {
    it('should return bookings list', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/bookings')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].bookingNumber).toBe('BK-2026-0001');
    });

    it('should pass query filters to service', async () => {
      await request(app.getHttpServer())
        .get('/v1/bookings?status=active&projectId=proj-1')
        .expect(200);

      expect(mockService.findAll).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ status: 'active', projectId: 'proj-1' }),
      );
    });
  });

  describe('GET /v1/bookings/:id', () => {
    it('should return a single booking', async () => {
      const id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const res = await request(app.getHttpServer())
        .get(`/v1/bookings/${id}`)
        .expect(200);

      expect(res.body.data.bookingNumber).toBe('BK-2026-0001');
      expect(mockService.findOne).toHaveBeenCalledWith(undefined, id);
    });

    it('should reject non-UUID id parameter', async () => {
      await request(app.getHttpServer())
        .get('/v1/bookings/not-a-uuid')
        .expect(400);
    });
  });

  describe('POST /v1/bookings', () => {
    const validDto = {
      customerId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      unitId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      projectId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      netPrice: 2700000,
      bookingFee: 100000,
      bookingFeeType: BookingFeeType.DEDUCTED_FROM_FIRST,
      validUntil: '2026-03-01T00:00:00Z',
    };

    it('should create a booking with valid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/bookings')
        .send(validDto)
        .expect(201);

      expect(res.body.data.bookingNumber).toBe('BK-2026-0001');
      expect(mockService.create).toHaveBeenCalledTimes(1);
    });

    it('should reject missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/v1/bookings')
        .send({ netPrice: 100 })
        .expect(400);
    });

    it('should reject invalid UUID for customerId', async () => {
      await request(app.getHttpServer())
        .post('/v1/bookings')
        .send({ ...validDto, customerId: 'bad-id' })
        .expect(400);
    });

    it('should reject negative netPrice', async () => {
      await request(app.getHttpServer())
        .post('/v1/bookings')
        .send({ ...validDto, netPrice: -100 })
        .expect(400);
    });
  });

  describe('PATCH /v1/bookings/:id/cancel', () => {
    it('should cancel a booking', async () => {
      const id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const res = await request(app.getHttpServer())
        .patch(`/v1/bookings/${id}/cancel`)
        .send({ reason: 'Customer withdrew' })
        .expect(200);

      expect(res.body.data.status).toBe(BookingStatus.CANCELLED);
      expect(mockService.cancel).toHaveBeenCalledWith(undefined, id, 'Customer withdrew', undefined);
    });
  });
});
