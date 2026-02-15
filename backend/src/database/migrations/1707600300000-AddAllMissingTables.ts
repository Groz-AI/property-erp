import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllMissingTables1707600300000 implements MigrationInterface {
  name = 'AddAllMissingTables1707600300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Brokers ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS brokers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        license_number VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        contact_person VARCHAR(255),
        company_name VARCHAR(255),
        tax_id VARCHAR(100),
        commission_method commission_method DEFAULT 'percentage',
        commission_rate DECIMAL(8,4) DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_brokers_tenant ON brokers(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_brokers_phone ON brokers(tenant_id, phone);
    `);

    // ── Bank Accounts ────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        account_name VARCHAR(255) NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(50) NOT NULL,
        iban VARCHAR(34),
        swift_code VARCHAR(11),
        currency VARCHAR(3) DEFAULT 'AED',
        coa_account_id UUID REFERENCES chart_of_accounts(id),
        opening_balance NUMERIC(15,2) DEFAULT 0,
        current_balance NUMERIC(15,2) DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_tenant ON bank_accounts(tenant_id);
    `);

    // ── Vendors ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        registration_number VARCHAR(100),
        tax_id VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        contact_person VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(3),
        payment_terms_days INT DEFAULT 30,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_vendors_tenant ON vendors(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors(tenant_id, phone);
    `);

    // ── Contractors ──────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contractors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        license_number VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        contact_person VARCHAR(255),
        specialization VARCHAR(100),
        retention_pct DECIMAL(5,2) DEFAULT 10,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        notes TEXT,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_contractors_tenant ON contractors(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_contractors_phone ON contractors(tenant_id, phone);
    `);

    // ── Progress Claims ─────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS progress_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        claim_number VARCHAR(50) NOT NULL,
        contractor_id UUID NOT NULL REFERENCES contractors(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        claim_date DATE NOT NULL,
        period_from DATE NOT NULL,
        period_to DATE NOT NULL,
        gross_amount DECIMAL(16,2) NOT NULL,
        retention_amount DECIMAL(16,2) DEFAULT 0,
        deductions DECIMAL(16,2) DEFAULT 0,
        net_amount DECIMAL(16,2) NOT NULL,
        status claim_status DEFAULT 'draft',
        notes TEXT,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_progress_claims_tenant ON progress_claims(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_progress_claims_number ON progress_claims(tenant_id, claim_number);
    `);

    // ── Handovers ────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS handovers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        handover_number VARCHAR(50) NOT NULL,
        contract_id UUID NOT NULL REFERENCES contracts(id),
        unit_id UUID NOT NULL REFERENCES units(id),
        customer_id UUID NOT NULL REFERENCES customers(id),
        scheduled_date DATE,
        actual_date DATE,
        inspector_id UUID REFERENCES users(id),
        status handover_status DEFAULT 'pending',
        snag_count INT DEFAULT 0,
        resolved_snag_count INT DEFAULT 0,
        notes TEXT,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_handovers_tenant ON handovers(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_handovers_number ON handovers(tenant_id, handover_number);
    `);

    // ── Inventory Items ─────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        category VARCHAR(100),
        uom VARCHAR(50),
        unit_cost DECIMAL(14,2) DEFAULT 0,
        reorder_level INT DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_items_tenant ON items(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_items_code ON items(tenant_id, code);
    `);

    // ── Maintenance Tickets ─────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS maintenance_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        ticket_number VARCHAR(50) NOT NULL,
        unit_id UUID NOT NULL REFERENCES units(id),
        customer_id UUID NOT NULL REFERENCES customers(id),
        contract_id UUID REFERENCES contracts(id),
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100),
        priority ticket_priority DEFAULT 'medium',
        status ticket_status DEFAULT 'open',
        assigned_to UUID REFERENCES users(id),
        sla_due_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        resolution_notes TEXT,
        cost_amount DECIMAL(14,2) DEFAULT 0,
        is_warranty BOOLEAN DEFAULT FALSE,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_maint_tickets_tenant ON maintenance_tickets(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_maint_tickets_number ON maintenance_tickets(tenant_id, ticket_number);
      CREATE INDEX IF NOT EXISTS idx_maint_tickets_status ON maintenance_tickets(tenant_id, status);
    `);

    // ── Payslips ─────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payslips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        payslip_number VARCHAR(50) NOT NULL,
        employee_id UUID NOT NULL REFERENCES employees(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        period_month INT NOT NULL,
        period_year INT NOT NULL,
        basic_salary DECIMAL(14,2) DEFAULT 0,
        housing_allowance DECIMAL(14,2) DEFAULT 0,
        transport_allowance DECIMAL(14,2) DEFAULT 0,
        other_allowances DECIMAL(14,2) DEFAULT 0,
        overtime_amount DECIMAL(14,2) DEFAULT 0,
        gross_salary DECIMAL(14,2) DEFAULT 0,
        deductions DECIMAL(14,2) DEFAULT 0,
        loan_deduction DECIMAL(14,2) DEFAULT 0,
        net_salary DECIMAL(14,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'AED',
        status VARCHAR(20) DEFAULT 'draft',
        paid_at TIMESTAMPTZ,
        journal_entry_id UUID REFERENCES journal_entries(id),
        notes TEXT,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_payslips_tenant ON payslips(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_payslips_number ON payslips(tenant_id, payslip_number);
      CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
    `);

    // ── Purchase Orders ─────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        po_number VARCHAR(50) NOT NULL,
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        branch_id UUID REFERENCES branches(id),
        project_id UUID REFERENCES projects(id),
        order_date DATE NOT NULL,
        delivery_date DATE,
        description TEXT,
        subtotal DECIMAL(16,2) DEFAULT 0,
        tax_amount DECIMAL(16,2) DEFAULT 0,
        total_amount DECIMAL(16,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'AED',
        status po_status DEFAULT 'draft',
        notes TEXT,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_po_tenant ON purchase_orders(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_po_number ON purchase_orders(tenant_id, po_number);
      CREATE INDEX IF NOT EXISTS idx_po_vendor ON purchase_orders(vendor_id);
    `);

    // ── Price Lists ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS price_lists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        project_id UUID NOT NULL REFERENCES projects(id),
        effective_from DATE NOT NULL,
        effective_to DATE,
        currency VARCHAR(3) DEFAULT 'AED',
        is_active BOOLEAN DEFAULT TRUE,
        notes TEXT,
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_price_lists_tenant ON price_lists(tenant_id);
    `);

    // ── WBS Items (Project Costing) ─────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wbs_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        parent_id UUID REFERENCES wbs_items(id),
        budget_amount DECIMAL(16,2) DEFAULT 0,
        actual_amount DECIMAL(16,2) DEFAULT 0,
        committed_amount DECIMAL(16,2) DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_wbs_items_tenant ON wbs_items(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_wbs_items_project ON wbs_items(project_id);
    `);

    // ── Refunds ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS refunds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        refund_number VARCHAR(50) NOT NULL UNIQUE,
        contract_id UUID NOT NULL REFERENCES contracts(id),
        customer_id UUID NOT NULL REFERENCES customers(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        amount NUMERIC(15,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'AED',
        reason TEXT,
        status refund_status DEFAULT 'requested',
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMPTZ,
        paid_at TIMESTAMPTZ,
        journal_entry_id UUID REFERENCES journal_entries(id),
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_refunds_tenant ON refunds(tenant_id);
    `);

    // ── Revenue Recognition Schedules ───────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rev_rec_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        contract_id UUID NOT NULL REFERENCES contracts(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        method revenue_recognition_method NOT NULL,
        total_revenue NUMERIC(15,2) NOT NULL,
        recognized_revenue NUMERIC(15,2) DEFAULT 0,
        deferred_revenue NUMERIC(15,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'AED',
        recognition_start DATE NOT NULL,
        recognition_end DATE,
        completion_pct NUMERIC(5,2) DEFAULT 0,
        status VARCHAR(30) DEFAULT 'active',
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_rev_rec_tenant ON rev_rec_schedules(tenant_id);
    `);

    // ── AP Invoices ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ap_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        company_id UUID NOT NULL REFERENCES companies(id),
        po_id UUID REFERENCES purchase_orders(id),
        invoice_date DATE NOT NULL,
        due_date DATE NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        paid_amount NUMERIC(15,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'AED',
        status VARCHAR(30) DEFAULT 'draft',
        description TEXT,
        journal_entry_id UUID REFERENCES journal_entries(id),
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_ap_invoices_tenant ON ap_invoices(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_ap_invoices_vendor ON ap_invoices(vendor_id);
    `);

    // ── Fixed Assets ────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fixed_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        asset_code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        company_id UUID NOT NULL REFERENCES companies(id),
        branch_id UUID REFERENCES branches(id),
        purchase_date DATE NOT NULL,
        purchase_cost NUMERIC(15,2) NOT NULL,
        salvage_value NUMERIC(15,2) DEFAULT 0,
        useful_life_months INT NOT NULL,
        depreciation_method VARCHAR(30) DEFAULT 'straight_line',
        accumulated_depreciation NUMERIC(15,2) DEFAULT 0,
        net_book_value NUMERIC(15,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'AED',
        status VARCHAR(30) DEFAULT 'active',
        disposed_at TIMESTAMPTZ,
        disposal_amount NUMERIC(15,2),
        version INT DEFAULT 1,
        created_by UUID REFERENCES users(id),
        updated_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_fixed_assets_tenant ON fixed_assets(tenant_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'fixed_assets', 'ap_invoices', 'rev_rec_schedules', 'refunds',
      'wbs_items', 'price_lists', 'purchase_orders', 'payslips',
      'maintenance_tickets', 'items', 'handovers', 'progress_claims',
      'contractors', 'vendors', 'bank_accounts', 'brokers',
    ];
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
  }
}
