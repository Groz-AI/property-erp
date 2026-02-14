# Database Schema — Part 3: Finance, Accounting, Procurement, Inventory

## F) Finance & Accounting

```sql
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL REFERENCES companies(id),
  account_code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  account_type account_type NOT NULL,
  sub_type VARCHAR(50), -- current_asset, fixed_asset, etc.
  parent_id UUID REFERENCES chart_of_accounts(id),
  level INTEGER NOT NULL DEFAULT 1,
  is_header BOOLEAN DEFAULT false, -- header accounts cannot receive postings
  is_active BOOLEAN DEFAULT true,
  currency_code VARCHAR(3), -- NULL = company default
  normal_balance VARCHAR(6) NOT NULL DEFAULT 'debit', -- debit or credit
  description TEXT,
  tags VARCHAR(50)[], -- ar, ap, bank, cash, tax, intercompany, deferred_revenue
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_coa_code ON chart_of_accounts(tenant_id, company_id, account_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_coa_parent ON chart_of_accounts(tenant_id, company_id, parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_coa_type ON chart_of_accounts(tenant_id, company_id, account_type) WHERE deleted_at IS NULL;

CREATE TABLE fiscal_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(100) NOT NULL, -- e.g. "Jan 2026", "FY2026"
  period_type VARCHAR(20) NOT NULL DEFAULT 'month', -- month, quarter, year
  start_date DATE NOT NULL, end_date DATE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  is_open BOOLEAN DEFAULT true,
  is_year_end BOOLEAN DEFAULT false,
  closed_by UUID, closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_fiscal ON fiscal_periods(tenant_id, company_id, start_date, end_date);

CREATE TABLE cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  code VARCHAR(20) NOT NULL, name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  parent_id UUID REFERENCES cost_centers(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_cc_code ON cost_centers(tenant_id, company_id, code) WHERE deleted_at IS NULL;

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  journal_number VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),
  reference VARCHAR(255), description TEXT, description_ar TEXT,
  source_type VARCHAR(50), -- manual, booking, contract, receipt, refund, payroll, etc.
  source_id UUID,
  currency_code VARCHAR(3) NOT NULL,
  exchange_rate DECIMAL(18,8) DEFAULT 1,
  total_debit DECIMAL(18,2) NOT NULL,
  total_credit DECIMAL(18,2) NOT NULL,
  status journal_status DEFAULT 'draft',
  posted_by UUID, posted_at TIMESTAMPTZ,
  reversed_by UUID, reversed_at TIMESTAMPTZ,
  reversal_of UUID REFERENCES journal_entries(id),
  is_auto_generated BOOLEAN DEFAULT false,
  is_reversal BOOLEAN DEFAULT false,
  tags VARCHAR(50)[],
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID
);
CREATE UNIQUE INDEX idx_je_num ON journal_entries(tenant_id, company_id, journal_number);
CREATE INDEX idx_je_date ON journal_entries(tenant_id, company_id, entry_date);
CREATE INDEX idx_je_source ON journal_entries(tenant_id, source_type, source_id);
CREATE INDEX idx_je_status ON journal_entries(tenant_id, company_id, status);
CREATE INDEX idx_je_period ON journal_entries(tenant_id, fiscal_period_id);

CREATE TABLE journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id),
  line_number INTEGER NOT NULL,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  description TEXT,
  debit DECIMAL(18,2) NOT NULL DEFAULT 0,
  credit DECIMAL(18,2) NOT NULL DEFAULT 0,
  currency_code VARCHAR(3),
  foreign_debit DECIMAL(18,2) DEFAULT 0,
  foreign_credit DECIMAL(18,2) DEFAULT 0,
  exchange_rate DECIMAL(18,8) DEFAULT 1,
  -- Dimensions
  company_id UUID REFERENCES companies(id),
  branch_id UUID REFERENCES branches(id),
  project_id UUID,
  phase_id UUID,
  cost_center_id UUID REFERENCES cost_centers(id),
  customer_id UUID,
  vendor_id UUID,
  unit_id UUID,
  contract_id UUID,
  -- Reconciliation
  is_reconciled BOOLEAN DEFAULT false,
  reconciliation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_jl_entry ON journal_lines(tenant_id, journal_entry_id);
CREATE INDEX idx_jl_account ON journal_lines(tenant_id, account_id);
CREATE INDEX idx_jl_project ON journal_lines(tenant_id, project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_jl_customer ON journal_lines(tenant_id, customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_jl_vendor ON journal_lines(tenant_id, vendor_id) WHERE vendor_id IS NOT NULL;

CREATE TABLE accounting_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- booking_created, contract_signed, payment_received, etc.
  name VARCHAR(255) NOT NULL, description TEXT,
  debit_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  credit_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  conditions JSONB DEFAULT '{}', -- optional conditions for rule matching
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- higher priority rules evaluated first
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_acct_rules ON accounting_rules(tenant_id, company_id, event_type) WHERE deleted_at IS NULL;

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL, branch_id UUID,
  account_name VARCHAR(255) NOT NULL, account_number VARCHAR(100),
  bank_name VARCHAR(255), branch_name VARCHAR(255),
  iban VARCHAR(50), swift_code VARCHAR(20),
  currency_code VARCHAR(3) NOT NULL,
  gl_account_id UUID REFERENCES chart_of_accounts(id),
  current_balance DECIMAL(18,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_bank_acct ON bank_accounts(tenant_id, company_id) WHERE deleted_at IS NULL;

CREATE TABLE cashboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL, branch_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  gl_account_id UUID REFERENCES chart_of_accounts(id),
  current_balance DECIMAL(18,2) DEFAULT 0,
  custodian_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts(id),
  cashbox_id UUID REFERENCES cashboxes(id),
  transaction_date DATE NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- deposit, withdrawal, transfer, fee, interest
  reference VARCHAR(255), description TEXT,
  amount DECIMAL(18,2) NOT NULL, -- positive = in, negative = out
  balance_after DECIMAL(18,2),
  source_type VARCHAR(50), source_id UUID,
  journal_entry_id UUID REFERENCES journal_entries(id),
  is_reconciled BOOLEAN DEFAULT false,
  reconciliation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID
);
CREATE INDEX idx_bank_txn ON bank_transactions(tenant_id, bank_account_id, transaction_date);

CREATE TABLE bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, bank_account_id UUID NOT NULL,
  period_start DATE NOT NULL, period_end DATE NOT NULL,
  statement_balance DECIMAL(18,2) NOT NULL,
  book_balance DECIMAL(18,2) NOT NULL,
  difference DECIMAL(18,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed
  reconciled_by UUID, reconciled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bank_reconciliation_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  reconciliation_id UUID NOT NULL REFERENCES bank_reconciliations(id),
  bank_transaction_id UUID REFERENCES bank_transactions(id),
  statement_line JSONB, -- imported bank statement line
  match_status VARCHAR(20) DEFAULT 'unmatched', -- matched, unmatched, exception
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE revenue_recognition_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES contracts(id),
  method revenue_recognition_method NOT NULL,
  total_revenue DECIMAL(18,2) NOT NULL,
  recognized_to_date DECIMAL(18,2) DEFAULT 0,
  deferred_revenue DECIMAL(18,2) DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rev_rec ON revenue_recognition_schedules(tenant_id, contract_id);

CREATE TABLE revenue_recognition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  schedule_id UUID NOT NULL REFERENCES revenue_recognition_schedules(id),
  recognition_date DATE NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  trigger_type VARCHAR(50), -- milestone, percentage, delivery
  trigger_detail JSONB,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vendor_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  bill_number VARCHAR(50) NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  bill_date DATE NOT NULL, due_date DATE NOT NULL,
  po_id UUID, -- reference to purchase order
  subtotal DECIMAL(18,2) NOT NULL, tax_amount DECIMAL(18,2) DEFAULT 0,
  withholding_tax DECIMAL(18,2) DEFAULT 0,
  total_amount DECIMAL(18,2) NOT NULL,
  paid_amount DECIMAL(18,2) DEFAULT 0,
  balance DECIMAL(18,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  currency_code VARCHAR(3) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, approved, partially_paid, paid, cancelled
  journal_entry_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_vbill_num ON vendor_bills(tenant_id, company_id, bill_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_vbill_vendor ON vendor_bills(tenant_id, vendor_id) WHERE deleted_at IS NULL;

CREATE TABLE vendor_bill_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  bill_id UUID NOT NULL REFERENCES vendor_bills(id),
  description VARCHAR(500) NOT NULL,
  account_id UUID REFERENCES chart_of_accounts(id),
  project_id UUID, wbs_item_id UUID, cost_center_id UUID,
  quantity DECIMAL(12,4) DEFAULT 1,
  unit_price DECIMAL(18,4) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  tax_rule_id UUID, tax_amount DECIMAL(18,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  payment_number VARCHAR(50) NOT NULL,
  vendor_id UUID NOT NULL, bill_id UUID REFERENCES vendor_bills(id),
  amount DECIMAL(18,2) NOT NULL, currency_code VARCHAR(3) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_date DATE NOT NULL, reference VARCHAR(255),
  bank_account_id UUID, cashbox_id UUID,
  withholding_tax DECIMAL(18,2) DEFAULT 0,
  journal_entry_id UUID, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID
);

CREATE TABLE fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  asset_code VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL,
  category VARCHAR(100), location VARCHAR(255),
  acquisition_date DATE NOT NULL, acquisition_cost DECIMAL(18,2) NOT NULL,
  useful_life_months INTEGER NOT NULL, salvage_value DECIMAL(18,2) DEFAULT 0,
  depreciation_method VARCHAR(20) DEFAULT 'straight_line',
  accumulated_depreciation DECIMAL(18,2) DEFAULT 0,
  net_book_value DECIMAL(18,2),
  currency_code VARCHAR(3) NOT NULL,
  asset_account_id UUID REFERENCES chart_of_accounts(id),
  depreciation_account_id UUID REFERENCES chart_of_accounts(id),
  expense_account_id UUID REFERENCES chart_of_accounts(id),
  status VARCHAR(20) DEFAULT 'active', -- active, disposed, written_off
  disposed_at DATE, disposal_proceeds DECIMAL(18,2),
  assigned_to UUID, -- employee custody
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_fa_code ON fixed_assets(tenant_id, company_id, asset_code) WHERE deleted_at IS NULL;

CREATE TABLE depreciation_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  asset_id UUID NOT NULL REFERENCES fixed_assets(id),
  period_date DATE NOT NULL, amount DECIMAL(18,2) NOT NULL,
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL, fiscal_year INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, approved, closed
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, budget_id UUID NOT NULL REFERENCES budgets(id),
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  project_id UUID, cost_center_id UUID,
  period_start DATE NOT NULL, period_end DATE NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_budg_lines ON budget_lines(tenant_id, budget_id, account_id);
```

## G) Procurement & Inventory

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, vendor_number VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  category VARCHAR(100), contact_name VARCHAR(255),
  email VARCHAR(255), phone VARCHAR(50),
  tax_id VARCHAR(100), bank_details JSONB, address JSONB,
  payment_terms_days INTEGER DEFAULT 30,
  rating INTEGER, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_vendor_num ON vendors(tenant_id, vendor_number) WHERE deleted_at IS NULL;

CREATE TABLE purchase_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  pr_number VARCHAR(50) NOT NULL,
  requested_by UUID NOT NULL REFERENCES users(id),
  project_id UUID, department VARCHAR(100),
  justification TEXT, required_by DATE,
  total_estimated_cost DECIMAL(18,2) DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_approval, approved, rejected, converted
  approved_by UUID, approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
CREATE UNIQUE INDEX idx_pr_num ON purchase_requisitions(tenant_id, pr_number);

CREATE TABLE pr_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  pr_id UUID NOT NULL REFERENCES purchase_requisitions(id),
  item_id UUID REFERENCES items(id),
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(12,4) NOT NULL,
  uom VARCHAR(20), estimated_unit_price DECIMAL(18,4),
  estimated_total DECIMAL(18,2),
  wbs_item_id UUID, -- for job costing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  rfq_number VARCHAR(50) NOT NULL,
  pr_id UUID REFERENCES purchase_requisitions(id),
  vendor_ids UUID[] NOT NULL, -- vendors invited
  deadline TIMESTAMPTZ, description TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, closed
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE rfq_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, rfq_id UUID NOT NULL REFERENCES rfqs(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  total_amount DECIMAL(18,2), currency_code VARCHAR(3),
  delivery_days INTEGER, payment_terms TEXT,
  line_items JSONB, -- [{item, qty, unit_price, total}]
  is_selected BOOLEAN DEFAULT false, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  po_number VARCHAR(50) NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  pr_id UUID, rfq_id UUID,
  project_id UUID, delivery_address JSONB,
  order_date DATE NOT NULL, expected_delivery DATE,
  subtotal DECIMAL(18,2) NOT NULL, tax_amount DECIMAL(18,2) DEFAULT 0,
  total_amount DECIMAL(18,2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  payment_terms_days INTEGER,
  status po_status DEFAULT 'draft',
  approved_by UUID, approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, version INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX idx_po_num ON purchase_orders(tenant_id, po_number);
CREATE INDEX idx_po_vendor ON purchase_orders(tenant_id, vendor_id);

CREATE TABLE po_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  po_id UUID NOT NULL REFERENCES purchase_orders(id),
  item_id UUID REFERENCES items(id),
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(12,4) NOT NULL,
  received_quantity DECIMAL(12,4) DEFAULT 0,
  uom VARCHAR(20), unit_price DECIMAL(18,4) NOT NULL,
  total DECIMAL(18,2) NOT NULL,
  tax_amount DECIMAL(18,2) DEFAULT 0,
  wbs_item_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  grn_number VARCHAR(50) NOT NULL,
  po_id UUID NOT NULL REFERENCES purchase_orders(id),
  vendor_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  received_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, confirmed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
CREATE UNIQUE INDEX idx_grn_num ON grns(tenant_id, grn_number);

CREATE TABLE grn_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, grn_id UUID NOT NULL REFERENCES grns(id),
  po_line_id UUID NOT NULL REFERENCES po_lines(id),
  item_id UUID, description VARCHAR(500),
  ordered_quantity DECIMAL(12,4),
  received_quantity DECIMAL(12,4) NOT NULL,
  accepted_quantity DECIMAL(12,4),
  rejected_quantity DECIMAL(12,4) DEFAULT 0,
  uom VARCHAR(20), unit_cost DECIMAL(18,4),
  location_id UUID,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL, branch_id UUID,
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255), code VARCHAR(20),
  address JSONB, project_id UUID, -- site warehouse
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  code VARCHAR(50) NOT NULL, name VARCHAR(255),
  parent_id UUID REFERENCES warehouse_locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, item_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  category VARCHAR(100), sub_category VARCHAR(100),
  uom VARCHAR(20) NOT NULL, -- unit of measure
  secondary_uom VARCHAR(20), conversion_factor DECIMAL(12,4),
  reorder_level DECIMAL(12,4), reorder_quantity DECIMAL(12,4),
  weighted_avg_cost DECIMAL(18,4) DEFAULT 0,
  description TEXT, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_item_code ON items(tenant_id, item_code) WHERE deleted_at IS NULL;

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES items(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  location_id UUID REFERENCES warehouse_locations(id),
  movement_type stock_movement_type NOT NULL,
  quantity DECIMAL(12,4) NOT NULL, -- always positive
  unit_cost DECIMAL(18,4),
  total_cost DECIMAL(18,2),
  reference_type VARCHAR(50), -- grn, issue, transfer, adjustment, count
  reference_id UUID,
  project_id UUID, wbs_item_id UUID, contractor_id UUID,
  from_warehouse_id UUID, to_warehouse_id UUID, -- for transfers
  reason TEXT, notes TEXT,
  journal_entry_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID
);
CREATE INDEX idx_stock_mv ON stock_movements(tenant_id, item_id, warehouse_id);
CREATE INDEX idx_stock_mv_project ON stock_movements(tenant_id, project_id) WHERE project_id IS NOT NULL;

CREATE TABLE stock_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES items(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  location_id UUID,
  quantity DECIMAL(12,4) NOT NULL DEFAULT 0,
  reserved_quantity DECIMAL(12,4) DEFAULT 0,
  average_cost DECIMAL(18,4) DEFAULT 0,
  last_movement_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_stock_bal ON stock_balances(tenant_id, item_id, warehouse_id, COALESCE(location_id, '00000000-0000-0000-0000-000000000000'));

CREATE TABLE inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, warehouse_id UUID NOT NULL,
  count_type VARCHAR(20) DEFAULT 'full', -- full, cycle
  count_date DATE NOT NULL, status VARCHAR(20) DEFAULT 'in_progress',
  counted_by UUID, approved_by UUID,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_count_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  count_id UUID NOT NULL REFERENCES inventory_counts(id),
  item_id UUID NOT NULL REFERENCES items(id),
  location_id UUID,
  system_quantity DECIMAL(12,4) NOT NULL,
  counted_quantity DECIMAL(12,4),
  variance DECIMAL(12,4),
  unit_cost DECIMAL(18,4),
  variance_cost DECIMAL(18,2),
  adjustment_id UUID, -- stock_movement for adjustment
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
