import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitEntity } from '../entities/unit.entity';
import { UnitStatus } from '../../../shared/enums';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(UnitEntity)
    private readonly repo: Repository<UnitEntity>,
  ) {}

  async findAll(tenantId: string, filters?: {
    projectId?: string;
    status?: UnitStatus;
    type?: string;
    minBedrooms?: number;
    maxPrice?: number;
  }): Promise<UnitEntity[]> {
    const qb = this.repo.createQueryBuilder('u')
      .leftJoinAndSelect('u.project', 'project')
      .where('u.tenantId = :tenantId', { tenantId });

    if (filters?.projectId) qb.andWhere('u.projectId = :projectId', { projectId: filters.projectId });
    if (filters?.status) qb.andWhere('u.status = :status', { status: filters.status });
    if (filters?.type) qb.andWhere('u.type = :type', { type: filters.type });
    if (filters?.minBedrooms) qb.andWhere('u.bedrooms >= :minBedrooms', { minBedrooms: filters.minBedrooms });
    if (filters?.maxPrice) qb.andWhere('u.totalPrice <= :maxPrice', { maxPrice: filters.maxPrice });

    return qb.orderBy('u.code', 'ASC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<UnitEntity> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['project'],
    });
    if (!entity) throw new NotFoundException('Unit not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<UnitEntity>, userId: string): Promise<UnitEntity> {
    const entity = this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, data: Partial<UnitEntity>, userId: string): Promise<UnitEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, data, { updatedBy: userId });
    return this.repo.save(entity);
  }

  async getAvailabilitySummary(tenantId: string, projectId: string): Promise<Record<string, number>> {
    const result = await this.repo
      .createQueryBuilder('u')
      .select('u.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('u.tenantId = :tenantId AND u.projectId = :projectId', { tenantId, projectId })
      .groupBy('u.status')
      .getRawMany();

    const summary: Record<string, number> = {};
    for (const r of result) {
      summary[r.status] = parseInt(r.count, 10);
    }
    return summary;
  }
}
