import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from './entities/item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly repo: Repository<ItemEntity>,
  ) {}

  async findAll(tenantId: string, category?: string): Promise<ItemEntity[]> {
    const where: any = { tenantId };
    if (category) where.category = category;
    return this.repo.find({ where, order: { code: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<ItemEntity> {
    const e = await this.repo.findOne({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Item not found');
    return e;
  }

  async create(tenantId: string, data: Partial<ItemEntity>, userId: string): Promise<ItemEntity> {
    return this.repo.save(this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async update(tenantId: string, id: string, data: Partial<ItemEntity>, userId: string): Promise<ItemEntity> {
    const e = await this.findOne(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.repo.save(e);
  }
}
