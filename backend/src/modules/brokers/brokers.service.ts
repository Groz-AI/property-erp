import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrokerEntity } from './entities/broker.entity';

@Injectable()
export class BrokersService {
  constructor(
    @InjectRepository(BrokerEntity)
    private readonly repo: Repository<BrokerEntity>,
  ) {}

  async findAll(tenantId: string): Promise<BrokerEntity[]> {
    return this.repo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<BrokerEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Broker not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<BrokerEntity>, userId: string): Promise<BrokerEntity> {
    const entity = this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, data: Partial<BrokerEntity>, userId: string): Promise<BrokerEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, data, { updatedBy: userId });
    return this.repo.save(entity);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const entity = await this.findOne(tenantId, id);
    await this.repo.softRemove(entity);
  }
}
