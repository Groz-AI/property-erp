import { Entity, Column } from 'typeorm';
import { BaseVersionedEntity } from '../../../shared/entities/base.entity';

@Entity('price_lists')
export class PriceListEntity extends BaseVersionedEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date | null;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
