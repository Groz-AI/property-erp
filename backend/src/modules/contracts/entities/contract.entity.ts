import { Entity, Column, ManyToOne, JoinColumn, VersionColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { UnitEntity } from '../../properties/entities/unit.entity';
import { ProjectEntity } from '../../properties/entities/project.entity';
import { CompanyEntity } from '../../companies/entities/company.entity';
import { BookingEntity } from '../../bookings/entities/booking.entity';
import { ContractStatus } from '../../../shared/enums';

@Entity('contracts')
export class ContractEntity extends BaseEntity {
  @Index()
  @Column({ name: 'contract_number', type: 'varchar', length: 50 })
  contractNumber: string;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'contract_date', type: 'date' })
  contractDate: Date;

  @Column({ name: 'net_price', type: 'decimal', precision: 16, scale: 2 })
  netPrice: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 16, scale: 2 })
  totalAmount: number;

  @Column({ name: 'maintenance_deposit', type: 'decimal', precision: 16, scale: 2, default: 0 })
  maintenanceDeposit: number;

  @Column({ name: 'expected_delivery', type: 'date', nullable: true })
  expectedDelivery: Date | null;

  @Column({ name: 'warranty_months', type: 'int', default: 12 })
  warrantyMonths: number;

  @Column({ name: 'payment_plan_id', type: 'uuid', nullable: true })
  paymentPlanId: string | null;

  @Index()
  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT })
  status: ContractStatus;

  @Column({ name: 'signed_at', type: 'timestamptz', nullable: true })
  signedAt: Date | null;

  @Column({ name: 'activated_at', type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'cancellation_fee', type: 'decimal', precision: 16, scale: 2, nullable: true })
  cancellationFee: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @VersionColumn({ default: 1 })
  version: number;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ManyToOne(() => UnitEntity)
  @JoinColumn({ name: 'unit_id' })
  unit: UnitEntity;

  @ManyToOne(() => ProjectEntity)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @ManyToOne(() => BookingEntity)
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;
}
