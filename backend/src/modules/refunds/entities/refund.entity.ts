import { Entity, Column } from 'typeorm';
import { BaseVersionedEntity } from '../../../shared/entities/base.entity';
import { RefundStatus } from '../../../shared/enums';

@Entity('refunds')
export class RefundEntity extends BaseVersionedEntity {
  @Column({ name: 'refund_number', type: 'varchar', length: 50, unique: true })
  refundNumber: string;

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.REQUESTED })
  status: RefundStatus;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'journal_entry_id', type: 'uuid', nullable: true })
  journalEntryId: string | null;
}
