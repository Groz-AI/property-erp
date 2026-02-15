import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1707600000000 implements MigrationInterface {
  name = 'InitialSchema1707600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // ENUMS
    // ============================================================
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE unit_status AS ENUM ('available','soft_reserved','reserved','sold','blocked','under_maintenance','legal_hold','delivered','cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE booking_status AS ENUM ('active','expired','converted','cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE contract_status AS ENUM ('draft','under_review','signed','active','completed','cancelled','transferred');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE installment_status AS ENUM ('upcoming','due','overdue','partially_paid','paid','waived','rescheduled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE installment_type AS ENUM ('down_payment','installment','balloon','handover','maintenance_deposit');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE receipt_status AS ENUM ('draft','confirmed','reversed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE cheque_status AS ENUM ('received','under_collection','deposited','cleared','bounced','replaced','written_off');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE payment_method AS ENUM ('cash','bank_transfer','cheque','credit_card','online_gateway');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE journal_status AS ENUM ('draft','posted','reversed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE account_type AS ENUM ('asset','liability','equity','revenue','expense');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE lead_status AS ENUM ('new','contacted','qualified','opportunity','won','lost','disqualified');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE opportunity_stage AS ENUM ('discovery','proposal','negotiation','booking','won','lost');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE approval_status AS ENUM ('pending','approved','rejected','escalated','cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE po_status AS ENUM ('draft','pending_approval','approved','partially_received','received','closed','cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE claim_status AS ENUM ('draft','submitted','under_review','approved','partially_paid','paid','rejected');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE ticket_status AS ENUM ('open','assigned','in_progress','resolved','closed','reopened');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE ticket_priority AS ENUM ('low','medium','high','critical');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE commission_method AS ENUM ('fixed_amount','percentage','tiered','milestone');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE commission_status AS ENUM ('calculated','pending_approval','approved','paid','cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE refund_status AS ENUM ('requested','pending_approval','approved','paid','rejected');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE handover_status AS ENUM ('pending','initial_inspection','snag_rectification','final_inspection','completed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE stock_movement_type AS ENUM ('receive','issue','transfer_in','transfer_out','adjustment_in','adjustment_out');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE revenue_recognition_method AS ENUM ('delivery_based','percentage_of_completion','milestone_based');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE booking_fee_type AS ENUM ('refundable','non_refundable','deducted_from_first');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // ============================================================
    // CORE PLATFORM TABLES
    // ============================================================

    // Tenants
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        domain VARCHAR(255),
        logo_url VARCHAR(500),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        max_users INT NOT NULL DEFAULT 10,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        first_name_ar VARCHAR(100),
        last_name_ar VARCHAR(100),
        phone VARCHAR(50),
        avatar_url VARCHAR(500),
        preferred_language VARCHAR(5) DEFAULT 'en',
        timezone VARCHAR(50),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_system_admin BOOLEAN NOT NULL DEFAULT FALSE,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        last_login_at TIMESTAMPTZ,
        last_login_ip VARCHAR(45),
        failed_login_count INT DEFAULT 0,
        locked_until TIMESTAMPTZ,
        refresh_token_hash VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Companies
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        registration_number VARCHAR(100),
        tax_id VARCHAR(100),
        logo_url VARCHAR(500),
        default_currency VARCHAR(3) DEFAULT 'AED',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_companies_tenant ON companies(tenant_id);
    `);

    // Branches
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        code VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(3),
        phone VARCHAR(50),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_branches_tenant ON branches(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_branches_company ON branches(company_id);
    `);

    // Roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        permissions JSONB NOT NULL DEFAULT '[]',
        is_system BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);
    `);

    // User-Role junction
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        role_id UUID NOT NULL REFERENCES roles(id),
        company_id UUID REFERENCES companies(id),
        branch_id UUID REFERENCES branches(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, role_id, company_id, branch_id)
      );
    `);

    // Audit Logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id),
        user_id UUID REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        duration_ms INT,
        path VARCHAR(500),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_audit_tenant_entity ON audit_logs(tenant_id, entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
    `);

    // Settings (key-value per scope)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        company_id UUID REFERENCES companies(id),
        branch_id UUID REFERENCES branches(id),
        key VARCHAR(255) NOT NULL,
        value JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_scope_key ON settings(tenant_id, COALESCE(company_id, '00000000-0000-0000-0000-000000000000'), COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'), key);
    `);

    // Currencies
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS currencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        code VARCHAR(3) NOT NULL,
        name VARCHAR(100) NOT NULL,
        symbol VARCHAR(10),
        decimal_places INT DEFAULT 2,
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(tenant_id, code)
      );
    `);

    // Exchange Rates
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        from_currency VARCHAR(3) NOT NULL,
        to_currency VARCHAR(3) NOT NULL,
        rate DECIMAL(18,8) NOT NULL,
        effective_date DATE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup ON exchange_rates(tenant_id, from_currency, to_currency, effective_date DESC);
    `);

    // Tax Rules
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tax_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        rate DECIMAL(8,4) NOT NULL,
        is_inclusive BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ============================================================
    // PROPERTY CATALOG
    // ============================================================

    // Projects
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        branch_id UUID REFERENCES branches(id),
        code VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        type VARCHAR(50) DEFAULT 'residential',
        description TEXT,
        location_address TEXT,
        location_city VARCHAR(100),
        location_country VARCHAR(3),
        latitude DECIMAL(10,7),
        longitude DECIMAL(10,7),
        start_date DATE,
        expected_end_date DATE,
        completion_pct DECIMAL(5,2) DEFAULT 0,
        default_currency VARCHAR(3) DEFAULT 'AED',
        revenue_recognition_method revenue_recognition_method DEFAULT 'delivery_based',
        settings JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_code ON projects(tenant_id, code);
    `);

    // Phases
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS phases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        code VARCHAR(30) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        expected_delivery DATE,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_phases_code ON phases(tenant_id, project_id, code);
    `);

    // Buildings
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS buildings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        phase_id UUID NOT NULL REFERENCES phases(id),
        code VARCHAR(30) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        floors_count INT DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Floors
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS floors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        building_id UUID NOT NULL REFERENCES buildings(id),
        code VARCHAR(30) NOT NULL,
        name VARCHAR(100) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Units
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        phase_id UUID REFERENCES phases(id),
        building_id UUID REFERENCES buildings(id),
        floor_id UUID REFERENCES floors(id),
        code VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        bedrooms INT DEFAULT 0,
        bathrooms INT DEFAULT 0,
        built_up_area DECIMAL(12,2),
        net_area DECIMAL(12,2),
        garden_area DECIMAL(12,2),
        balcony_area DECIMAL(12,2),
        orientation VARCHAR(50),
        view_type VARCHAR(50),
        finishing VARCHAR(50) DEFAULT 'standard',
        price_per_sqm DECIMAL(14,2),
        total_price DECIMAL(16,2),
        status unit_status NOT NULL DEFAULT 'available',
        soft_reserved_until TIMESTAMPTZ,
        soft_reserved_by UUID REFERENCES users(id),
        attributes JSONB DEFAULT '{}',
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_units_code ON units(tenant_id, code);
      CREATE INDEX IF NOT EXISTS idx_units_project ON units(tenant_id, project_id);
      CREATE INDEX IF NOT EXISTS idx_units_status ON units(tenant_id, status);
    `);

    // Unit Status History
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS unit_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        unit_id UUID NOT NULL REFERENCES units(id),
        from_status unit_status,
        to_status unit_status NOT NULL,
        reason TEXT,
        reference_type VARCHAR(50),
        reference_id UUID,
        changed_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_unit_status_history ON unit_status_history(unit_id, created_at DESC);
    `);

    // ============================================================
    // CRM & SALES
    // ============================================================

    // Customers
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        customer_number VARCHAR(50),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        first_name_ar VARCHAR(100),
        last_name_ar VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        phone_alt VARCHAR(50),
        nationality VARCHAR(3),
        id_type VARCHAR(50),
        id_number VARCHAR(100),
        id_expiry DATE,
        date_of_birth DATE,
        gender VARCHAR(10),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(3),
        kyc_status VARCHAR(20) DEFAULT 'pending',
        risk_flag BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(tenant_id, phone);
    `);

    // Leads
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        source VARCHAR(50),
        channel VARCHAR(50),
        campaign_id UUID,
        status lead_status DEFAULT 'new',
        score INT DEFAULT 0,
        assigned_to UUID REFERENCES users(id),
        project_interest UUID REFERENCES projects(id),
        unit_type_interest VARCHAR(50),
        budget_min DECIMAL(16,2),
        budget_max DECIMAL(16,2),
        notes TEXT,
        converted_customer_id UUID REFERENCES customers(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON leads(tenant_id, status);
    `);

    // ============================================================
    // BOOKINGS & CONTRACTS
    // ============================================================

    // Bookings
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        booking_number VARCHAR(50) NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id),
        unit_id UUID NOT NULL REFERENCES units(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        agent_id UUID REFERENCES users(id),
        net_price DECIMAL(16,2) NOT NULL,
        discount_pct DECIMAL(5,2) DEFAULT 0,
        discount_amount DECIMAL(16,2) DEFAULT 0,
        booking_fee DECIMAL(16,2) NOT NULL DEFAULT 0,
        booking_fee_type booking_fee_type DEFAULT 'deducted_from_first',
        valid_until TIMESTAMPTZ NOT NULL,
        status booking_status NOT NULL DEFAULT 'active',
        cancellation_reason TEXT,
        notes TEXT,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_number ON bookings(tenant_id, booking_number);
    `);

    // Contracts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        contract_number VARCHAR(50) NOT NULL,
        booking_id UUID REFERENCES bookings(id),
        customer_id UUID NOT NULL REFERENCES customers(id),
        unit_id UUID NOT NULL REFERENCES units(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        contract_date DATE NOT NULL,
        net_price DECIMAL(16,2) NOT NULL,
        tax_amount DECIMAL(16,2) DEFAULT 0,
        total_amount DECIMAL(16,2) NOT NULL,
        maintenance_deposit DECIMAL(16,2) DEFAULT 0,
        expected_delivery DATE,
        warranty_months INT DEFAULT 12,
        payment_plan_id UUID,
        status contract_status NOT NULL DEFAULT 'draft',
        signed_at TIMESTAMPTZ,
        activated_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        cancellation_reason TEXT,
        cancellation_fee DECIMAL(16,2),
        notes TEXT,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_number ON contracts(tenant_id, contract_number);
      CREATE INDEX IF NOT EXISTS idx_contracts_customer ON contracts(tenant_id, customer_id);
      CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(tenant_id, status);
    `);

    // Installments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS installments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        contract_id UUID NOT NULL REFERENCES contracts(id),
        installment_number INT NOT NULL,
        type installment_type NOT NULL,
        due_date DATE NOT NULL,
        amount DECIMAL(16,2) NOT NULL,
        paid_amount DECIMAL(16,2) DEFAULT 0,
        penalty_amount DECIMAL(16,2) DEFAULT 0,
        status installment_status DEFAULT 'upcoming',
        grace_days INT DEFAULT 0,
        notes TEXT,
        version INT DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_installments_contract ON installments(contract_id);
      CREATE INDEX IF NOT EXISTS idx_installments_due ON installments(tenant_id, due_date, status);
    `);

    // ============================================================
    // COLLECTIONS
    // ============================================================

    // Receipts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        receipt_number VARCHAR(50) NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id),
        contract_id UUID REFERENCES contracts(id),
        amount DECIMAL(16,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'AED',
        exchange_rate DECIMAL(18,8) DEFAULT 1,
        payment_method payment_method NOT NULL,
        payment_date DATE NOT NULL,
        reference_number VARCHAR(100),
        bank_account_id UUID,
        cashbox_id UUID,
        status receipt_status DEFAULT 'draft',
        reversed_receipt_id UUID REFERENCES receipts(id),
        journal_entry_id UUID,
        notes TEXT,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_receipts_number ON receipts(tenant_id, receipt_number);
    `);

    // Receipt Allocations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS receipt_allocations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        receipt_id UUID NOT NULL REFERENCES receipts(id),
        installment_id UUID NOT NULL REFERENCES installments(id),
        amount DECIMAL(16,2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_allocations_receipt ON receipt_allocations(receipt_id);
      CREATE INDEX IF NOT EXISTS idx_allocations_installment ON receipt_allocations(installment_id);
    `);

    // Cheques
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cheques (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        cheque_number VARCHAR(50) NOT NULL,
        receipt_id UUID REFERENCES receipts(id),
        customer_id UUID NOT NULL REFERENCES customers(id),
        bank_name VARCHAR(255),
        amount DECIMAL(16,2) NOT NULL,
        due_date DATE NOT NULL,
        status cheque_status DEFAULT 'received',
        deposited_at TIMESTAMPTZ,
        cleared_at TIMESTAMPTZ,
        bounced_at TIMESTAMPTZ,
        bounce_reason TEXT,
        replacement_cheque_id UUID REFERENCES cheques(id),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_cheques_status ON cheques(tenant_id, status);
    `);

    // ============================================================
    // FINANCE & ACCOUNTING
    // ============================================================

    // Chart of Accounts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chart_of_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        code VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        type account_type NOT NULL,
        parent_id UUID REFERENCES chart_of_accounts(id),
        is_header BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        normal_balance VARCHAR(10) DEFAULT 'debit',
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_coa_code ON chart_of_accounts(tenant_id, code);
    `);

    // Fiscal Periods
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fiscal_periods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        name VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_open BOOLEAN DEFAULT TRUE,
        is_locked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Journal Entries
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        entry_number VARCHAR(50) NOT NULL,
        entry_date DATE NOT NULL,
        fiscal_period_id UUID REFERENCES fiscal_periods(id),
        description TEXT,
        source_type VARCHAR(50),
        source_id UUID,
        total_debit DECIMAL(16,2) NOT NULL DEFAULT 0,
        total_credit DECIMAL(16,2) NOT NULL DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'AED',
        exchange_rate DECIMAL(18,8) DEFAULT 1,
        status journal_status DEFAULT 'draft',
        posted_at TIMESTAMPTZ,
        posted_by UUID REFERENCES users(id),
        reversed_entry_id UUID REFERENCES journal_entries(id),
        is_auto_generated BOOLEAN DEFAULT FALSE,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_je_number ON journal_entries(tenant_id, entry_number);
      CREATE INDEX IF NOT EXISTS idx_je_source ON journal_entries(source_type, source_id);
    `);

    // Journal Lines
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS journal_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
        account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
        debit DECIMAL(16,2) DEFAULT 0,
        credit DECIMAL(16,2) DEFAULT 0,
        description TEXT,
        project_id UUID REFERENCES projects(id),
        branch_id UUID REFERENCES branches(id),
        cost_center VARCHAR(100),
        entity_type VARCHAR(50),
        entity_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_jl_entry ON journal_lines(journal_entry_id);
      CREATE INDEX IF NOT EXISTS idx_jl_account ON journal_lines(account_id);
    `);

    // Accounting Rules
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS accounting_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        company_id UUID REFERENCES companies(id),
        event_type VARCHAR(100) NOT NULL,
        description TEXT,
        debit_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
        credit_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
        is_active BOOLEAN DEFAULT TRUE,
        conditions JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_accounting_rules_event ON accounting_rules(tenant_id, event_type);
    `);

    // Approval Workflows
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS approval_workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        name VARCHAR(255) NOT NULL,
        action_type VARCHAR(100) NOT NULL,
        conditions JSONB DEFAULT '[]',
        steps JSONB NOT NULL DEFAULT '[]',
        escalation JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Approval Requests
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS approval_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        workflow_id UUID NOT NULL REFERENCES approval_workflows(id),
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        current_step INT DEFAULT 1,
        status approval_status DEFAULT 'pending',
        requested_by UUID NOT NULL REFERENCES users(id),
        approved_by UUID REFERENCES users(id),
        rejected_by UUID REFERENCES users(id),
        comments TEXT,
        data JSONB,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_approvals_status ON approval_requests(tenant_id, status);
    `);

    // Documents
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        file_name VARCHAR(500) NOT NULL,
        file_type VARCHAR(100),
        file_size BIGINT,
        storage_key VARCHAR(500) NOT NULL,
        storage_bucket VARCHAR(100) DEFAULT 'erp-documents',
        category VARCHAR(100),
        tags JSONB DEFAULT '[]',
        version INT DEFAULT 1,
        uploaded_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
    `);

    // Sequence Counters
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sequence_counters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        company_id UUID REFERENCES companies(id),
        type VARCHAR(50) NOT NULL,
        prefix VARCHAR(20),
        current_value BIGINT NOT NULL DEFAULT 0,
        year INT,
        UNIQUE(tenant_id, company_id, type, year)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'sequence_counters', 'documents', 'approval_requests', 'approval_workflows',
      'accounting_rules', 'journal_lines', 'journal_entries', 'fiscal_periods',
      'chart_of_accounts', 'cheques', 'receipt_allocations', 'receipts',
      'installments', 'contracts', 'bookings', 'leads', 'customers',
      'unit_status_history', 'units', 'floors', 'buildings', 'phases', 'projects',
      'tax_rules', 'exchange_rates', 'currencies', 'settings',
      'audit_logs', 'user_roles', 'roles', 'branches', 'companies', 'users', 'tenants',
    ];
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
  }
}
