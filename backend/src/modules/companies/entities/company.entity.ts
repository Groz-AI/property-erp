import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { TenantEntity } from '../../tenants/entities/tenant.entity';

@Entity('companies')
export class CompanyEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 255, nullable: true })
  nameAr: string | null;

  @Column({ name: 'registration_number', type: 'varchar', length: 100, nullable: true })
  registrationNumber: string | null;

  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId: string | null;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'default_currency', type: 'varchar', length: 3, default: 'AED' })
  defaultCurrency: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;
}
