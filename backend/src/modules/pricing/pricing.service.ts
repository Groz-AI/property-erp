import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceListEntity } from './entities/price-list.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PriceListEntity)
    private readonly repo: Repository<PriceListEntity>,
  ) {}

  async findAll(tenantId: string, projectId?: string): Promise<PriceListEntity[]> {
    const where: any = { tenantId };
    if (projectId) where.projectId = projectId;
    return this.repo.find({ where, order: { effectiveFrom: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<PriceListEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Price list not found');
    return entity;
  }

  async create(tenantId: string, dto: Partial<PriceListEntity>): Promise<PriceListEntity> {
    const entity = this.repo.create({ ...dto, tenantId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<PriceListEntity>): Promise<PriceListEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
