import { Entity, Column } from 'typeorm';
import { BaseVersionedEntity } from '../../../shared/entities/base.entity';
import { RevenueRecognitionMethod } from '../../../shared/enums';

@Entity('rev_rec_schedules')
export class RevRecScheduleEntity extends BaseVersionedEntity {
  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ type: 'enum', enum: RevenueRecognitionMethod })
  method: RevenueRecognitionMethod;

  @Column({ name: 'total_revenue', type: 'numeric', precision: 15, scale: 2 })
  totalRevenue: number;

  @Column({ name: 'recognized_revenue', type: 'numeric', precision: 15, scale: 2, default: 0 })
  recognizedRevenue: number;

  @Column({ name: 'deferred_revenue', type: 'numeric', precision: 15, scale: 2, default: 0 })
  deferredRevenue: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ name: 'recognition_start', type: 'date' })
  recognitionStart: Date;

  @Column({ name: 'recognition_end', type: 'date', nullable: true })
  recognitionEnd: Date | null;

  @Column({ name: 'completion_pct', type: 'numeric', precision: 5, scale: 2, default: 0 })
  completionPct: number;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;
}
