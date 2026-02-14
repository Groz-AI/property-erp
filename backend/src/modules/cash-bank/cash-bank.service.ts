import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountEntity } from './entities/bank-account.entity';

@Injectable()
export class CashBankService {
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly repo: Repository<BankAccountEntity>,
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
    const entity = this.repo.create({ ...dto, tenantId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, dto: Partial<BankAccountEntity>): Promise<BankAccountEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
