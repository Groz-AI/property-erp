import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmployeesTable1707600200000 implements MigrationInterface {
  name = 'AddEmployeesTable1707600200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        employee_number VARCHAR(50) NOT NULL,
        user_id UUID REFERENCES users(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        branch_id UUID REFERENCES branches(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        first_name_ar VARCHAR(100),
        last_name_ar VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        nationality VARCHAR(3),
        id_type VARCHAR(50),
        id_number VARCHAR(100),
        date_of_birth DATE,
        gender VARCHAR(10),
        department VARCHAR(100),
        job_title VARCHAR(255),
        hire_date DATE NOT NULL,
        termination_date DATE,
        basic_salary DECIMAL(14,2) DEFAULT 0,
        housing_allowance DECIMAL(14,2) DEFAULT 0,
        transport_allowance DECIMAL(14,2) DEFAULT 0,
        other_allowances DECIMAL(14,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'AED',
        bank_name VARCHAR(255),
        bank_account VARCHAR(100),
        iban VARCHAR(50),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_employees_number ON employees(tenant_id, employee_number);
      CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(tenant_id, company_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS employees CASCADE`);
  }
}
