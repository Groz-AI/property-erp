import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReceiptEntity } from './entities/receipt.entity';
import { InstallmentEntity } from '../installments/entities/installment.entity';
import { ReceiptStatus, InstallmentStatus } from '../../shared/enums';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(ReceiptEntity)
    private readonly receiptRepo: Repository<ReceiptEntity>,
    @InjectRepository(InstallmentEntity)
    private readonly installmentRepo: Repository<InstallmentEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAllReceipts(tenantId: string, filters?: { customerId?: string; contractId?: string; status?: ReceiptStatus }): Promise<ReceiptEntity[]> {
    const qb = this.receiptRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .where('r.tenantId = :tenantId', { tenantId });
    if (filters?.customerId) qb.andWhere('r.customerId = :customerId', { customerId: filters.customerId });
    if (filters?.contractId) qb.andWhere('r.contractId = :contractId', { contractId: filters.contractId });
    if (filters?.status) qb.andWhere('r.status = :status', { status: filters.status });
    return qb.orderBy('r.createdAt', 'DESC').getMany();
  }

  async findOneReceipt(tenantId: string, id: string): Promise<ReceiptEntity> {
    const entity = await this.receiptRepo.findOne({
      where: { id, tenantId },
      relations: ['customer', 'contract'],
    });
    if (!entity) throw new NotFoundException('Receipt not found');
    return entity;
  }

  async createReceipt(tenantId: string, data: Partial<ReceiptEntity>, allocations: { installmentId: string; amount: number }[], userId: string): Promise<ReceiptEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Generate receipt number
      const seqResult = await manager.query(
        `INSERT INTO sequence_counters (tenant_id, type, prefix, current_value, year)
         VALUES ($1, 'receipt', 'RV', 1, EXTRACT(YEAR FROM NOW())::INT)
         ON CONFLICT (tenant_id, company_id, type, year) DO UPDATE SET current_value = sequence_counters.current_value + 1
         RETURNING current_value`,
        [tenantId],
      );
      const seq = seqResult[0]?.current_value || 1;
      const year = new Date().getFullYear();
      const receiptNumber = `RV-${year}-${String(seq).padStart(5, '0')}`;

      const receipt = manager.create(ReceiptEntity, {
        ...data,
        tenantId,
        receiptNumber,
        status: ReceiptStatus.DRAFT,
        createdBy: userId,
        updatedBy: userId,
      });
      const saved = await manager.save(ReceiptEntity, receipt);

      // Allocate to installments
      let totalAllocated = 0;
      for (const alloc of allocations) {
        const installment = await manager.findOne(InstallmentEntity, {
          where: { id: alloc.installmentId, tenantId },
        });
        if (!installment) throw new NotFoundException(`Installment ${alloc.installmentId} not found`);

        const remainingDue = Number(installment.amount) + Number(installment.penaltyAmount) - Number(installment.paidAmount);
        if (alloc.amount > remainingDue + 0.01) {
          throw new BadRequestException(`Allocation ${alloc.amount} exceeds remaining due ${remainingDue} for installment ${installment.installmentNumber}`);
        }

        await manager.query(
          `INSERT INTO receipt_allocations (tenant_id, receipt_id, installment_id, amount) VALUES ($1, $2, $3, $4)`,
          [tenantId, saved.id, alloc.installmentId, alloc.amount],
        );

        // Update installment paid amount
        installment.paidAmount = Number(installment.paidAmount) + alloc.amount;
        const totalDue = Number(installment.amount) + Number(installment.penaltyAmount);
        if (installment.paidAmount >= totalDue - 0.01) {
          installment.status = InstallmentStatus.PAID;
        } else if (installment.paidAmount > 0) {
          installment.status = InstallmentStatus.PARTIALLY_PAID;
        }
        await manager.save(InstallmentEntity, installment);
        totalAllocated += alloc.amount;
      }

      if (Math.abs(totalAllocated - Number(saved.amount)) > 0.01) {
        throw new BadRequestException(`Total allocations (${totalAllocated}) must equal receipt amount (${saved.amount})`);
      }

      this.eventEmitter.emit('receipt.created', { tenantId, receipt: saved, allocations, userId });
      return saved;
    });
  }

  async confirmReceipt(tenantId: string, id: string, userId: string): Promise<ReceiptEntity> {
    const receipt = await this.findOneReceipt(tenantId, id);
    if (receipt.status !== ReceiptStatus.DRAFT) {
      throw new BadRequestException('Only draft receipts can be confirmed');
    }
    receipt.status = ReceiptStatus.CONFIRMED;
    receipt.updatedBy = userId;
    const saved = await this.receiptRepo.save(receipt);

    this.eventEmitter.emit('receipt.confirmed', { tenantId, receipt: saved, userId });
    return saved;
  }
}
