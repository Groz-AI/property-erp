import { Entity, Column, ManyToOne, JoinColumn, VersionColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ContractorEntity } from './contractor.entity';
import { ClaimStatus } from '../../../shared/enums';

@Entity('progress_claims')
export class ProgressClaimEntity extends BaseEntity {
  @Index()
  @Column({ name: 'claim_number', type: 'varchar', length: 50 })
  claimNumber: string;

  @Column({ name: 'contractor_id', type: 'uuid' })
  contractorId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'claim_date', type: 'date' })
  claimDate: Date;

  @Column({ name: 'period_from', type: 'date' })
  periodFrom: Date;

  @Column({ name: 'period_to', type: 'date' })
  periodTo: Date;

  @Column({ name: 'gross_amount', type: 'decimal', precision: 16, scale: 2 })
  grossAmount: number;

  @Column({ name: 'retention_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  retentionAmount: number;

  @Column({ name: 'deductions', type: 'decimal', precision: 16, scale: 2, default: 0 })
  deductions: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 16, scale: 2 })
  netAmount: number;

  @Index()
  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.DRAFT })
  status: ClaimStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @VersionColumn({ default: 1 })
  version: number;

  @ManyToOne(() => ContractorEntity)
  @JoinColumn({ name: 'contractor_id' })
  contractor: ContractorEntity;
}
