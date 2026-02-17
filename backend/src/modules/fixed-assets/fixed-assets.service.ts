import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FixedAssetEntity } from './entities/fixed-asset.entity';

@Injectable()
export class FixedAssetsService {
  constructor(
    @InjectRepository(FixedAssetEntity)
    private readonly repo: Repository<FixedAssetEntity>,
    private readonly dataSource: DataSource,
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
    if (!dto.companyId) {
      const [company] = await this.dataSource.query(
        `SELECT id FROM companies WHERE tenant_id = $1 AND is_active = true ORDER BY created_at LIMIT 1`, [tenantId],
      );
      if (!company) throw new BadRequestException('No active company found for this tenant');
      dto.companyId = company.id;
    }
    if (!dto.assetCode) {
      const [{ count }] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM fixed_assets WHERE tenant_id = $1`, [tenantId],
      );
      dto.assetCode = `FA-${String(count + 1).padStart(5, '0')}`;
    }
    const entity = this.repo.create({ ...dto, tenantId, netBookValue: dto.purchaseCost ?? 0 });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<FixedAssetEntity>): Promise<FixedAssetEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
