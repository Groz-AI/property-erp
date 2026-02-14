import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchEntity } from './entities/branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly repo: Repository<BranchEntity>,
  ) {}

  async findAll(tenantId: string, companyId?: string): Promise<BranchEntity[]> {
    const where: any = { tenantId };
    if (companyId) where.companyId = companyId;
    return this.repo.find({ where, relations: ['company'], order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<BranchEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId }, relations: ['company'] });
    if (!entity) throw new NotFoundException('Branch not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<BranchEntity>, userId: string): Promise<BranchEntity> {
    const entity = this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, data: Partial<BranchEntity>, userId: string): Promise<BranchEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, data, { updatedBy: userId });
    return this.repo.save(entity);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const entity = await this.findOne(tenantId, id);
    await this.repo.softRemove(entity);
  }
}
