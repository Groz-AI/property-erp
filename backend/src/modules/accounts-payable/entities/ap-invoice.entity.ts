import { Entity, Column } from 'typeorm';
import { BaseVersionedEntity } from '../../../shared/entities/base.entity';

@Entity('ap_invoices')
export class ApInvoiceEntity extends BaseVersionedEntity {
  @Column({ name: 'invoice_number', type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'po_id', type: 'uuid', nullable: true })
  poId: string | null;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'paid_amount', type: 'numeric', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ type: 'varchar', length: 30, default: 'draft' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'journal_entry_id', type: 'uuid', nullable: true })
  journalEntryId: string | null;
}
