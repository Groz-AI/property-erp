import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity } from './entities/lead.entity';
import { LeadStatus } from '../../shared/enums';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(LeadEntity)
    private readonly repo: Repository<LeadEntity>,
  ) {}

  async findAll(tenantId: string, filters?: { status?: LeadStatus; assignedTo?: string; source?: string }): Promise<LeadEntity[]> {
    const qb = this.repo.createQueryBuilder('l')
      .where('l.tenantId = :tenantId', { tenantId });
    if (filters?.status) qb.andWhere('l.status = :status', { status: filters.status });
    if (filters?.assignedTo) qb.andWhere('l.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
    if (filters?.source) qb.andWhere('l.source = :source', { source: filters.source });
    return qb.orderBy('l.createdAt', 'DESC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<LeadEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Lead not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<LeadEntity>, userId: string): Promise<LeadEntity> {
    const entity = this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, data: Partial<LeadEntity>, userId: string): Promise<LeadEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, data, { updatedBy: userId });
    return this.repo.save(entity);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const entity = await this.findOne(tenantId, id);
    await this.repo.softRemove(entity);
  }
}
