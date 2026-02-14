import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('contractors')
export class ContractorEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 255, nullable: true })
  nameAr: string | null;

  @Column({ name: 'license_number', type: 'varchar', length: 100, nullable: true })
  licenseNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ name: 'contact_person', type: 'varchar', length: 255, nullable: true })
  contactPerson: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialization: string | null;

  @Column({ name: 'retention_pct', type: 'decimal', precision: 5, scale: 2, default: 10 })
  retentionPct: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
