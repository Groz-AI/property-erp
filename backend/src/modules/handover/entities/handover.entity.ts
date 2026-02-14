import { Entity, Column, Index, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { HandoverStatus } from '../../../shared/enums';

@Entity('handovers')
export class HandoverEntity extends BaseEntity {
  @Index()
  @Column({ name: 'handover_number', type: 'varchar', length: 50 })
  handoverNumber: string;

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate: Date | null;

  @Column({ name: 'actual_date', type: 'date', nullable: true })
  actualDate: Date | null;

  @Column({ name: 'inspector_id', type: 'uuid', nullable: true })
  inspectorId: string | null;

  @Index()
  @Column({ type: 'enum', enum: HandoverStatus, default: HandoverStatus.PENDING })
  status: HandoverStatus;

  @Column({ name: 'snag_count', type: 'int', default: 0 })
  snagCount: number;

  @Column({ name: 'resolved_snag_count', type: 'int', default: 0 })
  resolvedSnagCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @VersionColumn({ default: 1 })
  version: number;
}
