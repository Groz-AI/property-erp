import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { LeadStatus } from '../../../shared/enums';

@Entity('leads')
export class LeadEntity extends BaseEntity {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  channel: string | null;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId: string | null;

  @Index()
  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string | null;

  @Column({ name: 'project_interest', type: 'uuid', nullable: true })
  projectInterest: string | null;

  @Column({ name: 'unit_type_interest', type: 'varchar', length: 50, nullable: true })
  unitTypeInterest: string | null;

  @Column({ name: 'budget_min', type: 'decimal', precision: 16, scale: 2, nullable: true })
  budgetMin: number | null;

  @Column({ name: 'budget_max', type: 'decimal', precision: 16, scale: 2, nullable: true })
  budgetMax: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'converted_customer_id', type: 'uuid', nullable: true })
  convertedCustomerId: string | null;
}
