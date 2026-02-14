import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixedAssetEntity } from './entities/fixed-asset.entity';

@Injectable()
export class FixedAssetsService {
  constructor(
    @InjectRepository(FixedAssetEntity)
    private readonly repo: Repository<FixedAssetEntity>,
  ) {}

  async findAll(tenantId: string, filters?: { category?: string; status?: string }): Promise<FixedAssetEntity[]> {
    const where: any = { tenantId };
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { assetCode: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<FixedAssetEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Fixed asset not found');
    return entity;
  }

  async create(tenantId: string, dto: Partial<FixedAssetEntity>): Promise<FixedAssetEntity> {
    const entity = this.repo.create({ ...dto, tenantId, netBookValue: dto.purchaseCost });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<FixedAssetEntity>): Promise<FixedAssetEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
