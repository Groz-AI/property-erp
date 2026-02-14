import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('vendors')
export class VendorEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 255, nullable: true })
  nameAr: string | null;

  @Column({ name: 'registration_number', type: 'varchar', length: 100, nullable: true })
  registrationNumber: string | null;

  @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
  taxId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ name: 'contact_person', type: 'varchar', length: 255, nullable: true })
  contactPerson: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  country: string | null;

  @Column({ name: 'payment_terms_days', type: 'int', default: 30 })
  paymentTermsDays: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
