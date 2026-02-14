import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('items')
export class ItemEntity extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 255, nullable: true })
  nameAr: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  uom: string | null;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 14, scale: 2, default: 0 })
  unitCost: number;

  @Column({ name: 'reorder_level', type: 'int', default: 0 })
  reorderLevel: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
