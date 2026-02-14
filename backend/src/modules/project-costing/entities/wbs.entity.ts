import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('wbs_items')
export class WbsEntity extends BaseEntity {
  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ name: 'budget_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  budgetAmount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  actualAmount: number;

  @Column({ name: 'committed_amount', type: 'decimal', precision: 16, scale: 2, default: 0 })
  committedAmount: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => WbsEntity)
  @JoinColumn({ name: 'parent_id' })
  parent: WbsEntity | null;
}
