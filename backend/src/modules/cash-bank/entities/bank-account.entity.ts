import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('bank_accounts')
export class BankAccountEntity extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'account_name', type: 'varchar', length: 255 })
  accountName: string;

  @Column({ name: 'bank_name', type: 'varchar', length: 255 })
  bankName: string;

  @Column({ name: 'account_number', type: 'varchar', length: 50 })
  accountNumber: string;

  @Column({ type: 'varchar', length: 34, nullable: true })
  iban: string | null;

  @Column({ name: 'swift_code', type: 'varchar', length: 11, nullable: true })
  swiftCode: string | null;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ name: 'coa_account_id', type: 'uuid', nullable: true })
  coaAccountId: string | null;

  @Column({ name: 'opening_balance', type: 'numeric', precision: 15, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ name: 'current_balance', type: 'numeric', precision: 15, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
