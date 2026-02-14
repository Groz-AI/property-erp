import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingEntity } from '../entities/booking.entity';
import { UnitEntity } from '../../properties/entities/unit.entity';
import { UnitStatus, BookingStatus } from '../../../shared/enums';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(UnitEntity)
    private readonly unitRepo: Repository<UnitEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, dto: CreateBookingDto, userId: string): Promise<BookingEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Step 1: Acquire advisory lock on unit to prevent concurrent bookings
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtext($1))`,
        [`unit:${dto.unitId}`],
      );

      // Step 2: Load unit with current version
      const unit = await manager.findOne(UnitEntity, {
        where: { id: dto.unitId, tenantId },
      });

      if (!unit) {
        throw new NotFoundException('Unit not found');
      }

      // Step 3: Validate unit is available
      if (unit.status !== UnitStatus.AVAILABLE && unit.status !== UnitStatus.SOFT_RESERVED) {
        throw new ConflictException('UNIT_NOT_AVAILABLE');
      }

      // Step 4: Validate price
      if (dto.netPrice <= 0) {
        throw new BadRequestException('Net price must be greater than 0');
      }

      // Step 5: Update unit status with optimistic lock
      const updateResult = await manager.update(
        UnitEntity,
        { id: unit.id, version: unit.version },
        { status: UnitStatus.RESERVED, version: unit.version + 1, updatedBy: userId },
      );

      if (updateResult.affected === 0) {
        throw new ConflictException('CONCURRENT_MODIFICATION');
      }

      // Step 6: Generate booking number
      const seqResult = await manager.query(
        `INSERT INTO sequence_counters (tenant_id, type, prefix, current_value, year)
         VALUES ($1, 'booking', 'BK', 1, EXTRACT(YEAR FROM NOW())::INT)
         ON CONFLICT (tenant_id, company_id, type, year) DO UPDATE SET current_value = sequence_counters.current_value + 1
         RETURNING current_value`,
        [tenantId],
      );
      const seq = seqResult[0]?.current_value || 1;
      const year = new Date().getFullYear();
      const bookingNumber = `BK-${year}-${String(seq).padStart(4, '0')}`;

      // Step 7: Create booking
      const booking = manager.create(BookingEntity, {
        tenantId,
        bookingNumber,
        customerId: dto.customerId,
        unitId: dto.unitId,
        projectId: dto.projectId,
        agentId: userId,
        netPrice: dto.netPrice,
        discountPct: dto.discountPct || 0,
        discountAmount: dto.discountAmount || 0,
        bookingFee: dto.bookingFee || 0,
        bookingFeeType: dto.bookingFeeType,
        validUntil: dto.validUntil,
        status: BookingStatus.ACTIVE,
        createdBy: userId,
        updatedBy: userId,
      });

      const saved = await manager.save(BookingEntity, booking);

      // Step 8: Record unit status history
      await manager.query(
        `INSERT INTO unit_status_history (tenant_id, unit_id, from_status, to_status, reason, reference_type, reference_id, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tenantId, unit.id, unit.status, UnitStatus.RESERVED, 'Booking created', 'booking', saved.id, userId],
      );

      // Step 9: Emit domain event
      this.eventEmitter.emit('booking.created', {
        tenantId,
        booking: saved,
        unit,
        userId,
      });

      return saved;
    });
  }

  async findAll(tenantId: string, filters?: { status?: BookingStatus; projectId?: string }): Promise<BookingEntity[]> {
    const qb = this.bookingRepo.createQueryBuilder('b')
      .leftJoinAndSelect('b.customer', 'customer')
      .leftJoinAndSelect('b.unit', 'unit')
      .where('b.tenantId = :tenantId', { tenantId });

    if (filters?.status) {
      qb.andWhere('b.status = :status', { status: filters.status });
    }
    if (filters?.projectId) {
      qb.andWhere('b.projectId = :projectId', { projectId: filters.projectId });
    }

    return qb.orderBy('b.createdAt', 'DESC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findOne({
      where: { id, tenantId },
      relations: ['customer', 'unit', 'project'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async cancel(tenantId: string, id: string, reason: string, userId: string): Promise<BookingEntity> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(BookingEntity, {
        where: { id, tenantId, status: BookingStatus.ACTIVE },
      });

      if (!booking) {
        throw new NotFoundException('Active booking not found');
      }

      // Cancel booking
      booking.status = BookingStatus.CANCELLED;
      booking.cancellationReason = reason;
      booking.updatedBy = userId;
      await manager.save(BookingEntity, booking);

      // Release unit back to available
      await manager.update(UnitEntity, { id: booking.unitId }, {
        status: UnitStatus.AVAILABLE,
        updatedBy: userId,
      });

      // Record status history
      await manager.query(
        `INSERT INTO unit_status_history (tenant_id, unit_id, from_status, to_status, reason, reference_type, reference_id, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tenantId, booking.unitId, UnitStatus.RESERVED, UnitStatus.AVAILABLE, `Booking cancelled: ${reason}`, 'booking', booking.id, userId],
      );

      this.eventEmitter.emit('booking.cancelled', { tenantId, booking, userId });

      return booking;
    });
  }
}
