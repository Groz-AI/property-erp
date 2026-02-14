import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeEntity } from './entities/employee.entity';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly repo: Repository<EmployeeEntity>,
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
