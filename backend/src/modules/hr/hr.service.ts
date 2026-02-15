import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EmployeeEntity } from './entities/employee.entity';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly repo: Repository<EmployeeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(tenantId: string, filters?: { department?: string; isActive?: boolean }): Promise<EmployeeEntity[]> {
    const qb = this.repo.createQueryBuilder('e').where('e.tenantId = :tenantId', { tenantId });
    if (filters?.department) qb.andWhere('e.department = :department', { department: filters.department });
    if (filters?.isActive !== undefined) qb.andWhere('e.isActive = :isActive', { isActive: filters.isActive });
    return qb.orderBy('e.employeeNumber', 'ASC').getMany();
  }

  async findOne(tenantId: string, id: string): Promise<EmployeeEntity> {
    const e = await this.repo.findOne({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Employee not found');
    return e;
  }

  async create(tenantId: string, data: Partial<EmployeeEntity>, userId: string): Promise<EmployeeEntity> {
    // Auto-generate employee number if not provided
    if (!data.employeeNumber) {
      const [{ count }] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM employees WHERE tenant_id = $1`,
        [tenantId],
      );
      data.employeeNumber = `EMP-${String(count + 1).padStart(4, '0')}`;
    }

    // Auto-resolve companyId from tenant's first company if not provided
    if (!data.companyId) {
      const [company] = await this.dataSource.query(
        `SELECT id FROM companies WHERE tenant_id = $1 AND is_active = true ORDER BY created_at ASC LIMIT 1`,
        [tenantId],
      );
      if (!company) throw new BadRequestException('No company found for this tenant. Create a company first.');
      data.companyId = company.id;
    }

    return this.repo.save(this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async update(tenantId: string, id: string, data: Partial<EmployeeEntity>, userId: string): Promise<EmployeeEntity> {
    const e = await this.findOne(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.repo.save(e);
  }

  async terminate(tenantId: string, id: string, terminationDate: Date, userId: string): Promise<EmployeeEntity> {
    const e = await this.findOne(tenantId, id);
    e.terminationDate = terminationDate;
    e.isActive = false;
    e.updatedBy = userId;
    return this.repo.save(e);
  }
}
