import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PayslipEntity } from './entities/payslip.entity';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayslipEntity)
    private readonly repo: Repository<PayslipEntity>,
    private readonly dataSource: DataSource,
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
    if (!data.payslipNumber) {
      const [{ count }] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM payslips WHERE tenant_id = $1`, [tenantId],
      );
      data.payslipNumber = `PAY-${String(count + 1).padStart(4, '0')}`;
    }
    if (!data.companyId) {
      const [company] = await this.dataSource.query(
        `SELECT id FROM companies WHERE tenant_id = $1 AND is_active = true ORDER BY created_at ASC LIMIT 1`, [tenantId],
      );
      if (!company) throw new BadRequestException('No company found for this tenant.');
      data.companyId = company.id;
    }
    const gross = Number(data.basicSalary || 0) + Number(data.housingAllowance || 0) + Number(data.transportAllowance || 0) + Number(data.otherAllowances || 0) + Number(data.overtimeAmount || 0);
    data.grossSalary = gross;
    data.netSalary = gross - Number(data.deductions || 0) - Number(data.loanDeduction || 0);
    return this.repo.save(this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async update(tenantId: string, id: string, data: Partial<PayslipEntity>, userId: string): Promise<PayslipEntity> {
    const e = await this.findOne(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.repo.save(e);
  }
}
