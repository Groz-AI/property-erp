import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContractEntity } from './entities/contract.entity';
import { BookingEntity } from '../bookings/entities/booking.entity';
import { UnitEntity } from '../properties/entities/unit.entity';
import { ContractStatus, BookingStatus, UnitStatus } from '../../shared/enums';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(ContractEntity)
    private readonly repo: Repository<ContractEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, filters?: { status?: ContractStatus; customerId?: string; projectId?: string }): Promise<ContractEntity[]> {
    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.customer', 'customer')
      .leftJoinAndSelect('c.unit', 'unit')
      .where('c.tenantId = :tenantId', { tenantId });
    if (filters?.status) qb.andWhere('c.status = :status', { status: filters.status });
    if (filters?.customerId) qb.andWhere('c.customerId = :customerId', { customerId: filters.customerId });
    if (filters?.projectId) qb.andWhere('c.projectId = :projectId', { projectId: filters.projectId });
    return qb.orderBy('c.createdAt', 'DESC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<ContractEntity> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['customer', 'unit', 'project', 'company', 'booking'],
    });
    if (!entity) throw new NotFoundException('Contract not found');
    return entity;
  }

  async createFromBooking(tenantId: string, bookingId: string, data: Partial<ContractEntity>, userId: string): Promise<ContractEntity> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(BookingEntity, {
        where: { id: bookingId, tenantId, status: BookingStatus.ACTIVE },
      });
      if (!booking) throw new NotFoundException('Active booking not found');

      // Generate contract number
      const seqResult = await manager.query(
        `INSERT INTO sequence_counters (tenant_id, type, prefix, current_value, year)
         VALUES ($1, 'contract', 'CT', 1, EXTRACT(YEAR FROM NOW())::INT)
         ON CONFLICT (tenant_id, company_id, type, year) DO UPDATE SET current_value = sequence_counters.current_value + 1
         RETURNING current_value`,
        [tenantId],
      );
      const seq = seqResult[0]?.current_value || 1;
      const year = new Date().getFullYear();
      const contractNumber = `CT-${year}-${String(seq).padStart(4, '0')}`;

      const contract = manager.create(ContractEntity, {
        tenantId,
        contractNumber,
        bookingId: booking.id,
        customerId: booking.customerId,
        unitId: booking.unitId,
        projectId: booking.projectId,
        companyId: data.companyId!,
        contractDate: data.contractDate || new Date(),
        netPrice: booking.netPrice,
        taxAmount: data.taxAmount || 0,
        totalAmount: data.totalAmount || booking.netPrice,
        maintenanceDeposit: data.maintenanceDeposit || 0,
        expectedDelivery: data.expectedDelivery,
        warrantyMonths: data.warrantyMonths || 12,
        status: ContractStatus.DRAFT,
        createdBy: userId,
        updatedBy: userId,
      });

      const saved = await manager.save(ContractEntity, contract);

      // Convert booking status
      booking.status = BookingStatus.CONVERTED;
      await manager.save(BookingEntity, booking);

      // Update unit to sold
      await manager.update(UnitEntity, { id: booking.unitId }, {
        status: UnitStatus.SOLD,
        updatedBy: userId,
      });

      // Record unit history
      await manager.query(
        `INSERT INTO unit_status_history (tenant_id, unit_id, from_status, to_status, reason, reference_type, reference_id, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tenantId, booking.unitId, UnitStatus.RESERVED, UnitStatus.SOLD, 'Contract created', 'contract', saved.id, userId],
      );

      this.eventEmitter.emit('contract.created', { tenantId, contract: saved, booking, userId });

      return saved;
    });
  }

  async sign(tenantId: string, id: string, userId: string): Promise<ContractEntity> {
    const contract = await this.findOne(tenantId, id);
    if (contract.status !== ContractStatus.DRAFT && contract.status !== ContractStatus.UNDER_REVIEW) {
      throw new BadRequestException('Contract must be in draft or under review to sign');
    }
    contract.status = ContractStatus.SIGNED;
    contract.signedAt = new Date();
    contract.updatedBy = userId;
    const saved = await this.repo.save(contract);
    this.eventEmitter.emit('contract.signed', { tenantId, contract: saved, userId });
    return saved;
  }

  async activate(tenantId: string, id: string, userId: string): Promise<ContractEntity> {
    const contract = await this.findOne(tenantId, id);
    if (contract.status !== ContractStatus.SIGNED) {
      throw new BadRequestException('Contract must be signed to activate');
    }
    contract.status = ContractStatus.ACTIVE;
    contract.activatedAt = new Date();
    contract.updatedBy = userId;
    const saved = await this.repo.save(contract);
    this.eventEmitter.emit('contract.activated', { tenantId, contract: saved, userId });
    return saved;
  }

  async cancel(tenantId: string, id: string, reason: string, fee: number, userId: string): Promise<ContractEntity> {
    return this.dataSource.transaction(async (manager) => {
      const contract = await manager.findOne(ContractEntity, { where: { id, tenantId } });
      if (!contract) throw new NotFoundException('Contract not found');
      if ([ContractStatus.COMPLETED, ContractStatus.CANCELLED].includes(contract.status)) {
        throw new BadRequestException('Cannot cancel a completed or already cancelled contract');
      }

      contract.status = ContractStatus.CANCELLED;
      contract.cancelledAt = new Date();
      contract.cancellationReason = reason;
      contract.cancellationFee = fee;
      contract.updatedBy = userId;
      const saved = await manager.save(ContractEntity, contract);

      // Release unit
      await manager.update(UnitEntity, { id: contract.unitId }, {
        status: UnitStatus.AVAILABLE,
        updatedBy: userId,
      });

      await manager.query(
        `INSERT INTO unit_status_history (tenant_id, unit_id, from_status, to_status, reason, reference_type, reference_id, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tenantId, contract.unitId, UnitStatus.SOLD, UnitStatus.AVAILABLE, `Contract cancelled: ${reason}`, 'contract', contract.id, userId],
      );

      this.eventEmitter.emit('contract.cancelled', { tenantId, contract: saved, userId });
      return saved;
    });
  }
}
