import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('customers')
export class CustomerEntity extends BaseEntity {
  @Column({ name: 'customer_number', type: 'varchar', length: 50, nullable: true })
  customerNumber: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'first_name_ar', type: 'varchar', length: 100, nullable: true })
  firstNameAr: string | null;

  @Column({ name: 'last_name_ar', type: 'varchar', length: 100, nullable: true })
  lastNameAr: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ name: 'phone_alt', type: 'varchar', length: 50, nullable: true })
  phoneAlt: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  nationality: string | null;

  @Column({ name: 'id_type', type: 'varchar', length: 50, nullable: true })
  idType: string | null;

  @Column({ name: 'id_number', type: 'varchar', length: 100, nullable: true })
  idNumber: string | null;

  @Column({ name: 'id_expiry', type: 'date', nullable: true })
  idExpiry: Date | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  country: string | null;

  @Column({ name: 'kyc_status', type: 'varchar', length: 20, default: 'pending' })
  kycStatus: string;

  @Column({ name: 'risk_flag', type: 'boolean', default: false })
  riskFlag: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
