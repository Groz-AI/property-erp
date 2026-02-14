import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { CompanyEntity } from '../../companies/entities/company.entity';

@Entity('branches')
export class BranchEntity extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 255, nullable: true })
  nameAr: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  code: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;
}
