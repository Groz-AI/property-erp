import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevRecScheduleEntity } from './entities/rev-rec-schedule.entity';

@Injectable()
export class RevenueRecognitionService {
  constructor(
    @InjectRepository(RevRecScheduleEntity)
    private readonly repo: Repository<RevRecScheduleEntity>,
  ) {}

  async findAll(tenantId: string, contractId?: string): Promise<RevRecScheduleEntity[]> {
    const where: any = { tenantId };
    if (contractId) where.contractId = contractId;
    return this.repo.find({ where, order: { recognitionStart: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<RevRecScheduleEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Rev-rec schedule not found');
    return entity;
  }

  async create(tenantId: string, dto: Partial<RevRecScheduleEntity>): Promise<RevRecScheduleEntity> {
    const entity = this.repo.create({ ...dto, tenantId, deferredRevenue: dto.totalRevenue });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<RevRecScheduleEntity>): Promise<RevRecScheduleEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
