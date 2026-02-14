import { Entity, Column, Index, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { TicketStatus, TicketPriority } from '../../../shared/enums';

@Entity('maintenance_tickets')
export class MaintenanceTicketEntity extends BaseEntity {
  @Index()
  @Column({ name: 'ticket_number', type: 'varchar', length: 50 })
  ticketNumber: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  contractId: string | null;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Index()
  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Index()
  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string | null;

  @Column({ name: 'sla_due_at', type: 'timestamptz', nullable: true })
  slaDueAt: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string | null;

  @Column({ name: 'cost_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  costAmount: number;

  @Column({ name: 'is_warranty', type: 'boolean', default: false })
  isWarranty: boolean;

  @VersionColumn({ default: 1 })
  version: number;
}
