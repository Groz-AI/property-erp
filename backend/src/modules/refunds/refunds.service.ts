import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundEntity } from './entities/refund.entity';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(RefundEntity)
    private readonly repo: Repository<RefundEntity>,
  ) {}

  async findAll(tenantId: string, filters?: { customerId?: string; status?: string }): Promise<RefundEntity[]> {
    const where: any = { tenantId };
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<RefundEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Refund not found');
    return entity;
  }

  async create(tenantId: string, dto: Partial<RefundEntity>): Promise<RefundEntity> {
    const entity = this.repo.create({ ...dto, tenantId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<RefundEntity>): Promise<RefundEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
