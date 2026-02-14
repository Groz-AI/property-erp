import { Entity, Column, ManyToOne, JoinColumn, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { CompanyEntity } from '../../companies/entities/company.entity';
import { BranchEntity } from '../../branches/entities/branch.entity';

@Entity('projects')
export class ProjectEntity extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string | null;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 255, nullable: true })
  nameAr: string | null;

  @Column({ type: 'varchar', length: 50, default: 'residential' })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'location_address', type: 'text', nullable: true })
  locationAddress: string | null;

  @Column({ name: 'location_city', type: 'varchar', length: 100, nullable: true })
  locationCity: string | null;

  @Column({ name: 'location_country', type: 'varchar', length: 3, nullable: true })
  locationCountry: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'expected_end_date', type: 'date', nullable: true })
  expectedEndDate: Date | null;

  @Column({ name: 'completion_pct', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPct: number;

  @Column({ name: 'default_currency', type: 'varchar', length: 3, default: 'AED' })
  defaultCurrency: string;

  @Column({ name: 'revenue_recognition_method', type: 'enum', enum: ['delivery_based', 'percentage_of_completion', 'milestone_based'], default: 'delivery_based' })
  revenueRecognitionMethod: string;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @VersionColumn({ default: 1 })
  version: number;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;
}
