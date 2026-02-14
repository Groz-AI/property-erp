import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repo: Repository<CustomerEntity>,
  ) {}

  async findAll(tenantId: string, filters?: { kycStatus?: string; phone?: string }): Promise<CustomerEntity[]> {
    const qb = this.repo.createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId });
    if (filters?.kycStatus) qb.andWhere('c.kycStatus = :kycStatus', { kycStatus: filters.kycStatus });
    if (filters?.phone) qb.andWhere('c.phone ILIKE :phone', { phone: `%${filters.phone}%` });
    return qb.orderBy('c.createdAt', 'DESC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<CustomerEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Customer not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<CustomerEntity>, userId: string): Promise<CustomerEntity> {
    const entity = this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, data: Partial<CustomerEntity>, userId: string): Promise<CustomerEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, data, { updatedBy: userId });
    return this.repo.save(entity);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const entity = await this.findOne(tenantId, id);
    await this.repo.softRemove(entity);
  }
}
