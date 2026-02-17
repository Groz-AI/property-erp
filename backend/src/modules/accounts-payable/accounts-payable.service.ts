import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApInvoiceEntity } from './entities/ap-invoice.entity';

@Injectable()
export class AccountsPayableService {
  constructor(
    @InjectRepository(ApInvoiceEntity)
    private readonly repo: Repository<ApInvoiceEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(tenantId: string, filters?: { vendorId?: string; status?: string }): Promise<ApInvoiceEntity[]> {
    const where: any = { tenantId };
    if (filters?.vendorId) where.vendorId = filters.vendorId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { dueDate: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<ApInvoiceEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('AP invoice not found');
    return entity;
  }

  async create(tenantId: string, dto: Partial<ApInvoiceEntity>): Promise<ApInvoiceEntity> {
    if (!dto.companyId) {
      const [company] = await this.dataSource.query(
        `SELECT id FROM companies WHERE tenant_id = $1 AND is_active = true ORDER BY created_at LIMIT 1`, [tenantId],
      );
      if (!company) throw new BadRequestException('No active company found for this tenant');
      dto.companyId = company.id;
    }
    if (!dto.invoiceNumber) {
      const [{ count }] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM ap_invoices WHERE tenant_id = $1`, [tenantId],
      );
      dto.invoiceNumber = `APINV-${String(count + 1).padStart(5, '0')}`;
    }
    const entity = this.repo.create({ ...dto, tenantId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<ApInvoiceEntity>): Promise<ApInvoiceEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
