import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BankAccountEntity } from './entities/bank-account.entity';

@Injectable()
export class CashBankService {
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly repo: Repository<BankAccountEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(tenantId: string, companyId?: string): Promise<BankAccountEntity[]> {
    const where: any = { tenantId };
    if (companyId) where.companyId = companyId;
    return this.repo.find({ where, order: { accountName: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<BankAccountEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Bank account not found');
    return entity;
  }

  async create(tenantId: string, dto: Partial<BankAccountEntity>): Promise<BankAccountEntity> {
    if (!dto.companyId) {
      const [company] = await this.dataSource.query(
        `SELECT id FROM companies WHERE tenant_id = $1 AND is_active = true ORDER BY created_at LIMIT 1`, [tenantId],
      );
      if (!company) throw new BadRequestException('No active company found for this tenant');
      dto.companyId = company.id;
    }
    const entity = this.repo.create({ ...dto, tenantId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<BankAccountEntity>): Promise<BankAccountEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
