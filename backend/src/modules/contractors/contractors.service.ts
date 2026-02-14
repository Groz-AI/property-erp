import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractorEntity } from './entities/contractor.entity';
import { ProgressClaimEntity } from './entities/progress-claim.entity';
import { ClaimStatus } from '../../shared/enums';

@Injectable()
export class ContractorsService {
  constructor(
    @InjectRepository(ContractorEntity)
    private readonly contractorRepo: Repository<ContractorEntity>,
    @InjectRepository(ProgressClaimEntity)
    private readonly claimRepo: Repository<ProgressClaimEntity>,
  ) {}

  async findAllContractors(tenantId: string): Promise<ContractorEntity[]> {
    return this.contractorRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOneContractor(tenantId: string, id: string): Promise<ContractorEntity> {
    const e = await this.contractorRepo.findOne({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Contractor not found');
    return e;
  }

  async createContractor(tenantId: string, data: Partial<ContractorEntity>, userId: string): Promise<ContractorEntity> {
    return this.contractorRepo.save(this.contractorRepo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async updateContractor(tenantId: string, id: string, data: Partial<ContractorEntity>, userId: string): Promise<ContractorEntity> {
    const e = await this.findOneContractor(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.contractorRepo.save(e);
  }

  async findAllClaims(tenantId: string, filters?: { status?: ClaimStatus; contractorId?: string }): Promise<ProgressClaimEntity[]> {
    const qb = this.claimRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.contractor', 'contractor')
      .where('c.tenantId = :tenantId', { tenantId });
    if (filters?.status) qb.andWhere('c.status = :status', { status: filters.status });
    if (filters?.contractorId) qb.andWhere('c.contractorId = :contractorId', { contractorId: filters.contractorId });
    return qb.orderBy('c.createdAt', 'DESC').getMany();
  }

  async findOneClaim(tenantId: string, id: string): Promise<ProgressClaimEntity> {
    const e = await this.claimRepo.findOne({ where: { id, tenantId }, relations: ['contractor'] });
    if (!e) throw new NotFoundException('Progress claim not found');
    return e;
  }

  async createClaim(tenantId: string, data: Partial<ProgressClaimEntity>, userId: string): Promise<ProgressClaimEntity> {
    return this.claimRepo.save(this.claimRepo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async updateClaim(tenantId: string, id: string, data: Partial<ProgressClaimEntity>, userId: string): Promise<ProgressClaimEntity> {
    const e = await this.findOneClaim(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.claimRepo.save(e);
  }
}
