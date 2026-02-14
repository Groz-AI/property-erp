import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { UnitStatus, BookingStatus, BookingFeeType } from '../../../shared/enums';

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepoMock: any;
  let unitRepoMock: any;
  let dataSourceMock: any;
  let eventEmitterMock: any;

  // Reusable mock transaction manager
  let managerMock: any;

  const tenantId = 'tenant-1';
  const userId = 'user-1';

  const makeUnit = (overrides: any = {}) => ({
    id: 'unit-1',
    tenantId,
    status: UnitStatus.AVAILABLE,
    version: 1,
    ...overrides,
  });

  const makeDto = (overrides: any = {}) => ({
    unitId: 'unit-1',
    customerId: 'cust-1',
    projectId: 'proj-1',
    netPrice: 1000000,
    discountPct: 0,
    discountAmount: 0,
    bookingFee: 10000,
    bookingFeeType: BookingFeeType.DEDUCTED_FROM_FIRST,
    validUntil: new Date('2026-03-01'),
    ...overrides,
  });

  beforeEach(() => {
    managerMock = {
      query: jest.fn()
        .mockResolvedValueOnce(undefined) // advisory lock
        .mockResolvedValueOnce([{ current_value: 1 }]) // sequence counter
        .mockResolvedValueOnce(undefined), // unit_status_history insert
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      create: jest.fn().mockImplementation((_Entity: any, data: any) => ({ ...data, id: 'booking-1' })),
      save: jest.fn().mockImplementation((_Entity: any, data: any) => Promise.resolve({ ...data, id: 'booking-1' })),
    };

    dataSourceMock = {
      transaction: jest.fn().mockImplementation((cb: any) => cb(managerMock)),
    };

    bookingRepoMock = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      findOne: jest.fn(),
    };

    unitRepoMock = {};
    eventEmitterMock = { emit: jest.fn() };

    service = new BookingService(
      bookingRepoMock as any,
      unitRepoMock as any,
      dataSourceMock as any,
      eventEmitterMock as any,
    );
  });

  describe('create', () => {
    it('should create a booking for an available unit', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit());

      const result = await service.create(tenantId, makeDto(), userId);

      expect(result.id).toBe('booking-1');
      expect(result.status).toBe(BookingStatus.ACTIVE);
      expect(result.bookingNumber).toMatch(/^BK-\d{4}-0001$/);
      expect(managerMock.query).toHaveBeenCalledTimes(3); // lock + seq + history
      expect(managerMock.update).toHaveBeenCalledTimes(1); // unit status update
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('booking.created', expect.any(Object));
    });

    it('should create a booking for a soft-reserved unit', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit({ status: UnitStatus.SOFT_RESERVED }));

      const result = await service.create(tenantId, makeDto(), userId);

      expect(result.status).toBe(BookingStatus.ACTIVE);
    });

    it('should throw NotFoundException if unit not found', async () => {
      managerMock.findOne.mockResolvedValue(null);

      await expect(
        service.create(tenantId, makeDto(), userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if unit is already sold', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit({ status: UnitStatus.SOLD }));

      await expect(
        service.create(tenantId, makeDto(), userId),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if unit is already reserved', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit({ status: UnitStatus.RESERVED }));

      await expect(
        service.create(tenantId, makeDto(), userId),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if unit is blocked', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit({ status: UnitStatus.BLOCKED }));

      await expect(
        service.create(tenantId, makeDto(), userId),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if net price is 0', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit());

      await expect(
        service.create(tenantId, makeDto({ netPrice: 0 }), userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if net price is negative', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit());

      await expect(
        service.create(tenantId, makeDto({ netPrice: -500 }), userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException on optimistic lock failure', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit());
      managerMock.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.create(tenantId, makeDto(), userId),
      ).rejects.toThrow(ConflictException);
    });

    it('should acquire advisory lock on the unit', async () => {
      managerMock.findOne.mockResolvedValue(makeUnit());

      await service.create(tenantId, makeDto(), userId);

      expect(managerMock.query).toHaveBeenCalledWith(
        expect.stringContaining('pg_advisory_xact_lock'),
        [`unit:unit-1`],
      );
    });

    it('should emit booking.created event with correct payload', async () => {
      const unit = makeUnit();
      managerMock.findOne.mockResolvedValue(unit);

      await service.create(tenantId, makeDto(), userId);

      expect(eventEmitterMock.emit).toHaveBeenCalledWith('booking.created', {
        tenantId,
        booking: expect.objectContaining({ id: 'booking-1' }),
        unit,
        userId,
      });
    });
  });

  describe('findAll', () => {
    it('should return bookings for a tenant', async () => {
      const result = await service.findAll(tenantId);
      expect(result).toEqual([]);
      expect(bookingRepoMock.createQueryBuilder).toHaveBeenCalled();
    });

    it('should apply status filter', async () => {
      const qb = bookingRepoMock.createQueryBuilder();
      await service.findAll(tenantId, { status: BookingStatus.ACTIVE });
      expect(qb.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      const booking = { id: 'booking-1', tenantId };
      bookingRepoMock.findOne.mockResolvedValue(booking);

      const result = await service.findOne(tenantId, 'booking-1');
      expect(result.id).toBe('booking-1');
    });

    it('should throw NotFoundException if not found', async () => {
      bookingRepoMock.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel an active booking and release the unit', async () => {
      const booking = {
        id: 'booking-1',
        tenantId,
        unitId: 'unit-1',
        status: BookingStatus.ACTIVE,
      };
      managerMock.findOne.mockResolvedValue(booking);
      managerMock.save.mockImplementation((_Entity: any, data: any) => Promise.resolve(data));
      // Reset query mock for cancel flow (only history insert)
      managerMock.query.mockReset();
      managerMock.query.mockResolvedValue(undefined);

      const result = await service.cancel(tenantId, 'booking-1', 'Customer request', userId);

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(result.cancellationReason).toBe('Customer request');
      expect(managerMock.update).toHaveBeenCalled(); // unit released
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('booking.cancelled', expect.any(Object));
    });

    it('should throw NotFoundException if no active booking found', async () => {
      managerMock.findOne.mockResolvedValue(null);

      await expect(
        service.cancel(tenantId, 'nonexistent', 'reason', userId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
