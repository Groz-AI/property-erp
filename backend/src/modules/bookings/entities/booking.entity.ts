import { Entity, Column, ManyToOne, JoinColumn, VersionColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { UnitEntity } from '../../properties/entities/unit.entity';
import { ProjectEntity } from '../../properties/entities/project.entity';
import { BookingStatus, BookingFeeType } from '../../../shared/enums';

@Entity('bookings')
export class BookingEntity extends BaseEntity {
  @Index()
  @Column({ name: 'booking_number', type: 'varchar', length: 50 })
  bookingNumber: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ name: 'net_price', type: 'decimal', precision: 16, scale: 2 })
  netPrice: number;

  @Column({ name: 'discount_pct', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPct: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'booking_fee', type: 'decimal', precision: 16, scale: 2, default: 0 })
  bookingFee: number;

  @Column({ name: 'booking_fee_type', type: 'enum', enum: BookingFeeType, default: BookingFeeType.DEDUCTED_FROM_FIRST })
  bookingFeeType: BookingFeeType;

  @Column({ name: 'valid_until', type: 'timestamptz' })
  validUntil: Date;

  @Index()
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.ACTIVE })
  status: BookingStatus;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

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
}
