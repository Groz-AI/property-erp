import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RefundEntity } from './entities/refund.entity';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(RefundEntity)
    private readonly repo: Repository<RefundEntity>,
    private readonly dataSource: DataSource,
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
    if (!dto.companyId) {
      const [company] = await this.dataSource.query(
        `SELECT id FROM companies WHERE tenant_id = $1 AND is_active = true ORDER BY created_at LIMIT 1`, [tenantId],
      );
      if (!company) throw new BadRequestException('No active company found for this tenant');
      dto.companyId = company.id;
    }
    if (!dto.refundNumber) {
      const [{ count }] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM refunds WHERE tenant_id = $1`, [tenantId],
      );
      dto.refundNumber = `REF-${String(count + 1).padStart(5, '0')}`;
    }
    const entity = this.repo.create({ ...dto, tenantId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<RefundEntity>): Promise<RefundEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
