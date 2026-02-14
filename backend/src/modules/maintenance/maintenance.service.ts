import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceTicketEntity } from './entities/ticket.entity';
import { TicketStatus, TicketPriority } from '../../shared/enums';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceTicketEntity)
    private readonly repo: Repository<MaintenanceTicketEntity>,
  ) {}

  async findAll(tenantId: string, filters?: { status?: TicketStatus; priority?: TicketPriority; assignedTo?: string }): Promise<MaintenanceTicketEntity[]> {
    const qb = this.repo.createQueryBuilder('t').where('t.tenantId = :tenantId', { tenantId });
    if (filters?.status) qb.andWhere('t.status = :status', { status: filters.status });
    if (filters?.priority) qb.andWhere('t.priority = :priority', { priority: filters.priority });
    if (filters?.assignedTo) qb.andWhere('t.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
    return qb.orderBy('t.createdAt', 'DESC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<MaintenanceTicketEntity> {
    const e = await this.repo.findOne({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Ticket not found');
    return e;
  }

  async create(tenantId: string, data: Partial<MaintenanceTicketEntity>, userId: string): Promise<MaintenanceTicketEntity> {
    return this.repo.save(this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async update(tenantId: string, id: string, data: Partial<MaintenanceTicketEntity>, userId: string): Promise<MaintenanceTicketEntity> {
    const e = await this.findOne(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.repo.save(e);
  }
}
