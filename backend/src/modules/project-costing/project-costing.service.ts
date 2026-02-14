import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WbsEntity } from './entities/wbs.entity';

@Injectable()
export class ProjectCostingService {
  constructor(
    @InjectRepository(WbsEntity)
    private readonly repo: Repository<WbsEntity>,
  ) {}

  async findAll(tenantId: string, projectId?: string): Promise<WbsEntity[]> {
    const qb = this.repo.createQueryBuilder('w').where('w.tenantId = :tenantId', { tenantId });
    if (projectId) qb.andWhere('w.projectId = :projectId', { projectId });
    return qb.orderBy('w.sortOrder', 'ASC').addOrderBy('w.code', 'ASC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<WbsEntity> {
    const e = await this.repo.findOne({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('WBS item not found');
    return e;
  }

  async create(tenantId: string, data: Partial<WbsEntity>, userId: string): Promise<WbsEntity> {
    return this.repo.save(this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async update(tenantId: string, id: string, data: Partial<WbsEntity>, userId: string): Promise<WbsEntity> {
    const e = await this.findOne(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.repo.save(e);
  }
}
