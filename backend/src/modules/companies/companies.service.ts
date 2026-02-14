import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repo: Repository<CompanyEntity>,
  ) {}

  async findAll(tenantId: string): Promise<CompanyEntity[]> {
    return this.repo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<CompanyEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Company not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<CompanyEntity>, userId: string): Promise<CompanyEntity> {
    const entity = this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, data: Partial<CompanyEntity>, userId: string): Promise<CompanyEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, data, { updatedBy: userId });
    return this.repo.save(entity);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const entity = await this.findOne(tenantId, id);
    await this.repo.softRemove(entity);
  }
}
