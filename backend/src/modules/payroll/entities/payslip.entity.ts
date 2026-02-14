import { Entity, Column, Index, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('payslips')
export class PayslipEntity extends BaseEntity {
  @Index()
  @Column({ name: 'payslip_number', type: 'varchar', length: 50 })
  payslipNumber: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'period_month', type: 'int' })
  periodMonth: number;

  @Column({ name: 'period_year', type: 'int' })
  periodYear: number;

  @Column({ name: 'basic_salary', type: 'decimal', precision: 14, scale: 2, default: 0 })
  basicSalary: number;

  @Column({ name: 'housing_allowance', type: 'decimal', precision: 14, scale: 2, default: 0 })
  housingAllowance: number;

  @Column({ name: 'transport_allowance', type: 'decimal', precision: 14, scale: 2, default: 0 })
  transportAllowance: number;

  @Column({ name: 'other_allowances', type: 'decimal', precision: 14, scale: 2, default: 0 })
  otherAllowances: number;

  @Column({ name: 'overtime_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  overtimeAmount: number;

  @Column({ name: 'gross_salary', type: 'decimal', precision: 14, scale: 2, default: 0 })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  deductions: number;

  @Column({ name: 'loan_deduction', type: 'decimal', precision: 14, scale: 2, default: 0 })
  loanDeduction: number;

  @Column({ name: 'net_salary', type: 'decimal', precision: 14, scale: 2, default: 0 })
  netSalary: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'journal_entry_id', type: 'uuid', nullable: true })
  journalEntryId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @VersionColumn({ default: 1 })
  version: number;
}
