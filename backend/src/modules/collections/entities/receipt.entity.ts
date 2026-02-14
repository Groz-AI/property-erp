import { Entity, Column, ManyToOne, JoinColumn, VersionColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { ContractEntity } from '../../contracts/entities/contract.entity';
import { ReceiptStatus, PaymentMethod } from '../../../shared/enums';

@Entity('receipts')
export class ReceiptEntity extends BaseEntity {
  @Index()
  @Column({ name: 'receipt_number', type: 'varchar', length: 50 })
  receiptNumber: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ type: 'decimal', precision: 16, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 8, default: 1 })
  exchangeRate: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber: string | null;

  @Column({ name: 'bank_account_id', type: 'uuid', nullable: true })
  bankAccountId: string | null;

  @Column({ name: 'cashbox_id', type: 'uuid', nullable: true })
  cashboxId: string | null;

  @Index()
  @Column({ type: 'enum', enum: ReceiptStatus, default: ReceiptStatus.DRAFT })
  status: ReceiptStatus;

  @Column({ name: 'reversed_receipt_id', type: 'uuid', nullable: true })
  reversedReceiptId: string | null;

  @Column({ name: 'journal_entry_id', type: 'uuid', nullable: true })
  journalEntryId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @VersionColumn({ default: 1 })
  version: number;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ManyToOne(() => ContractEntity)
  @JoinColumn({ name: 'contract_id' })
  contract: ContractEntity;
}
