import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalRequestEntity } from './entities/approval-request.entity';
import { ApprovalStatus } from '../../shared/enums';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(ApprovalRequestEntity)
    private readonly repo: Repository<ApprovalRequestEntity>,
  ) {}

  async findAll(tenantId: string, filters?: { status?: ApprovalStatus; assignedTo?: string }): Promise<ApprovalRequestEntity[]> {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<ApprovalRequestEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Approval request not found');
    return entity;
  }

  async create(tenantId: string, dto: Partial<ApprovalRequestEntity>): Promise<ApprovalRequestEntity> {
    const entity = this.repo.create({ ...dto, tenantId });
    return this.repo.save(entity);
  }

  async resolve(tenantId: string, id: string, status: ApprovalStatus, comments: string, userId: string): Promise<ApprovalRequestEntity> {
    const entity = await this.findOne(tenantId, id);
    entity.status = status;
    entity.comments = comments;
    entity.resolvedAt = new Date();
    entity.resolvedBy = userId;
    return this.repo.save(entity);
  }
}
