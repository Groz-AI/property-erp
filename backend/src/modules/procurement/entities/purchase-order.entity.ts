import { Entity, Column, ManyToOne, JoinColumn, VersionColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { VendorEntity } from './vendor.entity';
import { POStatus } from '../../../shared/enums';

@Entity('purchase_orders')
export class PurchaseOrderEntity extends BaseEntity {
  @Index()
  @Column({ name: 'po_number', type: 'varchar', length: 50 })
  poNumber: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string | null;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'order_date', type: 'date' })
  orderDate: Date;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate: Date | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'subtotal', type: 'decimal', precision: 16, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Index()
  @Column({ type: 'enum', enum: POStatus, default: POStatus.DRAFT })
  status: POStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @VersionColumn({ default: 1 })
  version: number;

  @ManyToOne(() => VendorEntity)
  @JoinColumn({ name: 'vendor_id' })
  vendor: VendorEntity;
}
