import { Entity, Column, ManyToOne, JoinColumn, VersionColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ContractEntity } from '../../contracts/entities/contract.entity';
import { InstallmentStatus, InstallmentType } from '../../../shared/enums';

@Entity('installments')
export class InstallmentEntity extends BaseEntity {
  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @Column({ name: 'installment_number', type: 'int' })
  installmentNumber: number;

  @Column({ type: 'enum', enum: InstallmentType })
  type: InstallmentType;

  @Index()
  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 16, scale: 2 })
  amount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'penalty_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  penaltyAmount: number;

  @Index()
  @Column({ type: 'enum', enum: InstallmentStatus, default: InstallmentStatus.UPCOMING })
  status: InstallmentStatus;

  @Column({ name: 'grace_days', type: 'int', default: 0 })
  graceDays: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @VersionColumn({ default: 1 })
  version: number;

  @ManyToOne(() => ContractEntity)
  @JoinColumn({ name: 'contract_id' })
  contract: ContractEntity;
}
