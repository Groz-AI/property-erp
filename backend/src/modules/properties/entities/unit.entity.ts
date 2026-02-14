import { Entity, Column, ManyToOne, JoinColumn, VersionColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ProjectEntity } from './project.entity';
import { UnitStatus } from '../../../shared/enums';

@Entity('units')
export class UnitEntity extends BaseEntity {
  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'phase_id', type: 'uuid', nullable: true })
  phaseId: string | null;

  @Column({ name: 'building_id', type: 'uuid', nullable: true })
  buildingId: string | null;

  @Column({ name: 'floor_id', type: 'uuid', nullable: true })
  floorId: string | null;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'int', default: 0 })
  bedrooms: number;

  @Column({ type: 'int', default: 0 })
  bathrooms: number;

  @Column({ name: 'built_up_area', type: 'decimal', precision: 12, scale: 2, nullable: true })
  builtUpArea: number | null;

  @Column({ name: 'net_area', type: 'decimal', precision: 12, scale: 2, nullable: true })
  netArea: number | null;

  @Column({ name: 'garden_area', type: 'decimal', precision: 12, scale: 2, nullable: true })
  gardenArea: number | null;

  @Column({ name: 'balcony_area', type: 'decimal', precision: 12, scale: 2, nullable: true })
  balconyArea: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  orientation: string | null;

  @Column({ name: 'view_type', type: 'varchar', length: 50, nullable: true })
  viewType: string | null;

  @Column({ type: 'varchar', length: 50, default: 'standard' })
  finishing: string;

  @Column({ name: 'price_per_sqm', type: 'decimal', precision: 14, scale: 2, nullable: true })
  pricePerSqm: number | null;

  @Column({ name: 'total_price', type: 'decimal', precision: 16, scale: 2, nullable: true })
  totalPrice: number | null;

  @Index()
  @Column({ type: 'enum', enum: UnitStatus, default: UnitStatus.AVAILABLE })
  status: UnitStatus;

  @Column({ name: 'soft_reserved_until', type: 'timestamptz', nullable: true })
  softReservedUntil: Date | null;

  @Column({ name: 'soft_reserved_by', type: 'uuid', nullable: true })
  softReservedBy: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  attributes: Record<string, any>;

  @VersionColumn({ default: 1 })
  version: number;

  @ManyToOne(() => ProjectEntity)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;
}
