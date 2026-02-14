import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayslipEntity } from './entities/payslip.entity';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayslipEntity)
    private readonly repo: Repository<PayslipEntity>,
  ) {}

  async findAll(tenantId: string, filters?: { periodMonth?: number; periodYear?: number; status?: string }): Promise<PayslipEntity[]> {
    const qb = this.repo.createQueryBuilder('p').where('p.tenantId = :tenantId', { tenantId });
    if (filters?.periodMonth) qb.andWhere('p.periodMonth = :periodMonth', { periodMonth: filters.periodMonth });
    if (filters?.periodYear) qb.andWhere('p.periodYear = :periodYear', { periodYear: filters.periodYear });
    if (filters?.status) qb.andWhere('p.status = :status', { status: filters.status });
    return qb.orderBy('p.periodYear', 'DESC').addOrderBy('p.periodMonth', 'DESC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<PayslipEntity> {
    const e = await this.repo.findOne({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Payslip not found');
    return e;
  }

  async create(tenantId: string, data: Partial<PayslipEntity>, userId: string): Promise<PayslipEntity> {
    return this.repo.save(this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async update(tenantId: string, id: string, data: Partial<PayslipEntity>, userId: string): Promise<PayslipEntity> {
    const e = await this.findOne(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.repo.save(e);
  }
}
