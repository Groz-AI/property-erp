import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
  ) {}

  async findAll(): Promise<TenantEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TenantEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Tenant not found');
    return entity;
  }

  async findBySlug(slug: string): Promise<TenantEntity> {
    const entity = await this.repo.findOne({ where: { slug } });
    if (!entity) throw new NotFoundException('Tenant not found');
    return entity;
  }

  async create(data: Partial<TenantEntity>): Promise<TenantEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<TenantEntity>): Promise<TenantEntity> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }
}
