import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ApprovalStatus } from '../../../shared/enums';

@Entity('approval_requests')
export class ApprovalRequestEntity extends BaseEntity {
  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy: string;

  @Column({ name: 'assigned_to', type: 'uuid' })
  assignedTo: string;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  status: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy: string | null;
}
