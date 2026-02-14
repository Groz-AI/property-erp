import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { CommissionMethod } from '../../../shared/enums';

@Entity('brokers')
export class BrokerEntity extends BaseEntity {
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

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  companyName: string | null;

  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId: string | null;

  @Column({ name: 'commission_method', type: 'enum', enum: CommissionMethod, default: CommissionMethod.PERCENTAGE })
  commissionMethod: CommissionMethod;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 8, scale: 4, default: 0 })
  commissionRate: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
