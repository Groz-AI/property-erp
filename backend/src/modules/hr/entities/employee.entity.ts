import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('employees')
export class EmployeeEntity extends BaseEntity {
  @Index()
  @Column({ name: 'employee_number', type: 'varchar', length: 50 })
  employeeNumber: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string | null;

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

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  nationality: string | null;

  @Column({ name: 'id_type', type: 'varchar', length: 50, nullable: true })
  idType: string | null;

  @Column({ name: 'id_number', type: 'varchar', length: 100, nullable: true })
  idNumber: string | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string | null;

  @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
  jobTitle: string | null;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate: Date;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate: Date | null;

  @Column({ name: 'basic_salary', type: 'decimal', precision: 14, scale: 2, default: 0 })
  basicSalary: number;

  @Column({ name: 'housing_allowance', type: 'decimal', precision: 14, scale: 2, default: 0 })
  housingAllowance: number;

  @Column({ name: 'transport_allowance', type: 'decimal', precision: 14, scale: 2, default: 0 })
  transportAllowance: number;

  @Column({ name: 'other_allowances', type: 'decimal', precision: 14, scale: 2, default: 0 })
  otherAllowances: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ name: 'bank_name', type: 'varchar', length: 255, nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account', type: 'varchar', length: 100, nullable: true })
  bankAccount: string | null;

  @Column({ name: 'iban', type: 'varchar', length: 50, nullable: true })
  iban: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
