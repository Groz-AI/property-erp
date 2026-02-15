import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HandoverEntity } from './entities/handover.entity';
import { HandoverStatus } from '../../shared/enums';

@Injectable()
export class HandoverService {
  constructor(
    @InjectRepository(HandoverEntity)
    private readonly repo: Repository<HandoverEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(tenantId: string, filters?: { status?: HandoverStatus }): Promise<HandoverEntity[]> {
    const qb = this.repo.createQueryBuilder('h').where('h.tenantId = :tenantId', { tenantId });
    if (filters?.status) qb.andWhere('h.status = :status', { status: filters.status });
    return qb.orderBy('h.createdAt', 'DESC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<HandoverEntity> {
    const e = await this.repo.findOne({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Handover not found');
    return e;
  }

  async create(tenantId: string, data: Partial<HandoverEntity>, userId: string): Promise<HandoverEntity> {
    if (!data.handoverNumber) {
      const [{ count }] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM handovers WHERE tenant_id = $1`, [tenantId],
      );
      data.handoverNumber = `HO-${String(count + 1).padStart(4, '0')}`;
    }
    return this.repo.save(this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async update(tenantId: string, id: string, data: Partial<HandoverEntity>, userId: string): Promise<HandoverEntity> {
    const e = await this.findOne(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.repo.save(e);
  }
}
