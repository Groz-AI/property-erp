import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ChartOfAccountEntity } from './chart-of-account.entity';

@Entity('accounting_rules')
export class AccountingRuleEntity extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string | null;

  @Index()
  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'debit_account_id', type: 'uuid' })
  debitAccountId: string;

  @Column({ name: 'credit_account_id', type: 'uuid' })
  creditAccountId: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  conditions: Record<string, any>;

  @ManyToOne(() => ChartOfAccountEntity)
  @JoinColumn({ name: 'debit_account_id' })
  debitAccount: ChartOfAccountEntity;

  @ManyToOne(() => ChartOfAccountEntity)
  @JoinColumn({ name: 'credit_account_id' })
  creditAccount: ChartOfAccountEntity;
}
