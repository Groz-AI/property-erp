# Database Schema — Part 4: Project Costing, Contractors, Handover, HR/Payroll

## H) Project Costing & Contractors

```sql
CREATE TABLE wbs_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, project_id UUID NOT NULL REFERENCES projects(id),
  parent_id UUID REFERENCES wbs_items(id),
  code VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  level INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  planned_cost DECIMAL(18,2) DEFAULT 0,
  committed_cost DECIMAL(18,2) DEFAULT 0,  -- from approved POs
  actual_cost DECIMAL(18,2) DEFAULT 0,     -- from GRNs + issues + claims
  variance DECIMAL(18,2) GENERATED ALWAYS AS (planned_cost - actual_cost) STORED,
  completion_pct DECIMAL(5,2) DEFAULT 0,
  notes TEXT, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_wbs_code ON wbs_items(tenant_id, project_id, code) WHERE deleted_at IS NULL;
CREATE INDEX idx_wbs_parent ON wbs_items(tenant_id, project_id, parent_id);

CREATE TABLE wbs_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, wbs_item_id UUID NOT NULL REFERENCES wbs_items(id),
  budget_type VARCHAR(50) NOT NULL, -- material, labor, subcontractor, overhead, contingency
  planned_amount DECIMAL(18,2) NOT NULL,
  revised_amount DECIMAL(18,2),
  committed_amount DECIMAL(18,2) DEFAULT 0,
  actual_amount DECIMAL(18,2) DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wbs_budget ON wbs_budgets(tenant_id, wbs_item_id);

CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, contractor_number VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  specialization VARCHAR(100),
  contact_name VARCHAR(255), email VARCHAR(255), phone VARCHAR(50),
  tax_id VARCHAR(100), bank_details JSONB, address JSONB,
  insurance_info JSONB, -- {provider, policy_no, expiry}
  bonding_info JSONB,
  performance_score DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_contr_num ON contractors(tenant_id, contractor_number) WHERE deleted_at IS NULL;

CREATE TABLE contractor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  contract_number VARCHAR(50) NOT NULL,
  scope TEXT, start_date DATE, end_date DATE,
  contract_value DECIMAL(18,2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  retention_pct DECIMAL(5,2) DEFAULT 10,
  retention_release_schedule JSONB, -- [{event, pct}] e.g., [{event:'completion', pct:50},{event:'defect_liability_end', pct:50}]
  advance_amount DECIMAL(18,2) DEFAULT 0,
  advance_recovery_pct DECIMAL(5,2) DEFAULT 0, -- % deducted per claim
  penalty_terms JSONB, -- {daily_rate, cap_pct, conditions}
  wbs_items UUID[], -- linked WBS items
  status VARCHAR(20) DEFAULT 'active', -- draft, active, completed, terminated
  total_claimed DECIMAL(18,2) DEFAULT 0,
  total_paid DECIMAL(18,2) DEFAULT 0,
  total_retention DECIMAL(18,2) DEFAULT 0,
  retention_released DECIMAL(18,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, version INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX idx_cc_num ON contractor_contracts(tenant_id, contract_number);

CREATE TABLE progress_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contractor_contract_id UUID NOT NULL REFERENCES contractor_contracts(id),
  claim_number VARCHAR(50) NOT NULL,
  period_from DATE NOT NULL, period_to DATE NOT NULL,
  gross_amount DECIMAL(18,2) NOT NULL,
  -- Deductions
  advance_recovery DECIMAL(18,2) DEFAULT 0,
  retention_amount DECIMAL(18,2) DEFAULT 0,
  penalty_amount DECIMAL(18,2) DEFAULT 0,
  back_charges DECIMAL(18,2) DEFAULT 0,
  other_deductions DECIMAL(18,2) DEFAULT 0,
  net_amount DECIMAL(18,2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  status claim_status DEFAULT 'draft',
  submitted_at TIMESTAMPTZ, reviewed_by UUID, reviewed_at TIMESTAMPTZ,
  approved_by UUID, approved_at TIMESTAMPTZ,
  paid_amount DECIMAL(18,2) DEFAULT 0,
  journal_entry_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, version INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX idx_claim_num ON progress_claims(tenant_id, claim_number);
CREATE INDEX idx_claims_contract ON progress_claims(tenant_id, contractor_contract_id);

CREATE TABLE claim_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  claim_id UUID NOT NULL REFERENCES progress_claims(id),
  wbs_item_id UUID REFERENCES wbs_items(id),
  description VARCHAR(500) NOT NULL,
  uom VARCHAR(20),
  contract_quantity DECIMAL(12,4),
  contract_rate DECIMAL(18,4),
  previous_quantity DECIMAL(12,4) DEFAULT 0,
  current_quantity DECIMAL(12,4) NOT NULL,
  cumulative_quantity DECIMAL(12,4),
  current_amount DECIMAL(18,2) NOT NULL,
  cumulative_amount DECIMAL(18,2),
  notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_claim_lines ON claim_lines(tenant_id, claim_id);

CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contractor_contract_id UUID NOT NULL REFERENCES contractor_contracts(id),
  change_order_number VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  reason VARCHAR(100), -- scope_change, design_change, unforeseen, client_request
  cost_impact DECIMAL(18,2) NOT NULL, -- positive = increase, negative = decrease
  time_impact_days INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending_approval, approved, rejected
  approved_by UUID, approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE site_overhead_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, project_id UUID NOT NULL,
  period_from DATE NOT NULL, period_to DATE NOT NULL,
  category VARCHAR(100) NOT NULL, -- site_office, utilities, security, insurance, misc
  total_cost DECIMAL(18,2) NOT NULL,
  allocation_method VARCHAR(50), -- proportional_to_direct_cost, by_area, by_unit_count
  allocation_details JSONB, -- [{wbs_item_id, amount}]
  journal_entry_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID
);
```

## I) Handover & After-Sales

```sql
CREATE TABLE handover_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, project_id UUID,
  unit_type VARCHAR(50), -- applicable unit type, NULL = all
  name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL, -- [{code, description, category, is_required}]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES contracts(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  customer_id UUID NOT NULL,
  checklist_id UUID REFERENCES handover_checklists(id),
  handover_type VARCHAR(20) NOT NULL, -- initial, final
  status handover_status DEFAULT 'pending',
  scheduled_date DATE,
  inspection_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  inspector_id UUID REFERENCES users(id),
  customer_signature_url VARCHAR(500),
  report_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_handover_contract ON handovers(tenant_id, contract_id);
CREATE INDEX idx_handover_unit ON handovers(tenant_id, unit_id);

CREATE TABLE handover_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  handover_id UUID NOT NULL REFERENCES handovers(id),
  checklist_item_code VARCHAR(50),
  description VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  result VARCHAR(20), -- pass, fail, na
  photos JSONB, -- [{url, caption}]
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE snag_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  handover_id UUID NOT NULL REFERENCES handovers(id),
  unit_id UUID NOT NULL, contract_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
  total_items INTEGER DEFAULT 0, resolved_items INTEGER DEFAULT 0,
  assigned_contractor_id UUID REFERENCES contractors(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE snag_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  snag_list_id UUID NOT NULL REFERENCES snag_lists(id),
  description VARCHAR(500) NOT NULL,
  location VARCHAR(255), -- room, area
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  photos JSONB,
  status VARCHAR(20) DEFAULT 'open', -- open, assigned, fixed, verified, closed
  assigned_to UUID,
  fixed_at TIMESTAMPTZ, verified_at TIMESTAMPTZ, verified_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  ticket_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL, unit_id UUID NOT NULL, contract_id UUID,
  category VARCHAR(100) NOT NULL, -- plumbing, electrical, hvac, structural, finishing, other
  subject VARCHAR(255) NOT NULL, description TEXT,
  priority ticket_priority DEFAULT 'medium',
  status ticket_status DEFAULT 'open',
  is_under_warranty BOOLEAN DEFAULT false,
  warranty_expiry DATE,
  assigned_to UUID REFERENCES users(id),
  sla_response_hours INTEGER, sla_resolution_hours INTEGER,
  responded_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ, closed_at TIMESTAMPTZ,
  resolution TEXT,
  satisfaction_rating INTEGER, -- 1-5
  photos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
CREATE UNIQUE INDEX idx_ticket_num ON maintenance_tickets(tenant_id, ticket_number);
CREATE INDEX idx_ticket_status ON maintenance_tickets(tenant_id, status);
CREATE INDEX idx_ticket_cust ON maintenance_tickets(tenant_id, customer_id);

CREATE TABLE ticket_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  ticket_id UUID NOT NULL REFERENCES maintenance_tickets(id),
  activity_type VARCHAR(50) NOT NULL, -- comment, status_change, assignment, visit, photo_upload
  description TEXT,
  old_value VARCHAR(100), new_value VARCHAR(100),
  performed_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES contracts(id),
  unit_id UUID NOT NULL, customer_id UUID NOT NULL,
  total_deposited DECIMAL(18,2) DEFAULT 0,
  total_spent DECIMAL(18,2) DEFAULT 0,
  balance DECIMAL(18,2) GENERATED ALWAYS AS (total_deposited - total_spent) STORED,
  currency_code VARCHAR(3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_maint_dep ON maintenance_deposits(tenant_id, contract_id);

CREATE TABLE maintenance_deposit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  deposit_id UUID NOT NULL REFERENCES maintenance_deposits(id),
  transaction_type VARCHAR(20) NOT NULL, -- deposit, withdrawal
  amount DECIMAL(18,2) NOT NULL,
  description TEXT, reference VARCHAR(255),
  approved_by UUID, approved_at TIMESTAMPTZ,
  journal_entry_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID
);
```

## J) HR & Payroll

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  code VARCHAR(20), parent_id UUID REFERENCES departments(id),
  manager_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  employee_number VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id), -- link to system user
  first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
  first_name_ar VARCHAR(100), last_name_ar VARCHAR(100),
  email VARCHAR(255), phone VARCHAR(50),
  nationality VARCHAR(3), id_type VARCHAR(50), id_number VARCHAR(100),
  date_of_birth DATE, gender VARCHAR(10),
  hire_date DATE NOT NULL, termination_date DATE,
  department_id UUID REFERENCES departments(id),
  job_title VARCHAR(255), job_title_ar VARCHAR(255),
  manager_id UUID REFERENCES employees(id),
  branch_id UUID, project_id UUID,
  employment_type VARCHAR(20) DEFAULT 'full_time', -- full_time, part_time, contract
  address JSONB,
  bank_details JSONB, -- {bank_name, account_number, iban}
  emergency_contact JSONB,
  status VARCHAR(20) DEFAULT 'active', -- active, on_leave, terminated
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_emp_num ON employees(tenant_id, company_id, employee_number) WHERE deleted_at IS NULL;

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, employee_id UUID NOT NULL REFERENCES employees(id),
  date DATE NOT NULL,
  check_in TIMESTAMPTZ, check_out TIMESTAMPTZ,
  hours_worked DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'present', -- present, absent, late, half_day, holiday
  notes TEXT, source VARCHAR(20) DEFAULT 'manual', -- manual, biometric, mobile
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_attend ON attendance(tenant_id, employee_id, date);

CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL, name_ar VARCHAR(100),
  annual_allowance DECIMAL(5,1), -- days per year
  is_paid BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  entitled DECIMAL(5,1) DEFAULT 0,
  taken DECIMAL(5,1) DEFAULT 0,
  remaining DECIMAL(5,1) GENERATED ALWAYS AS (entitled - taken) STORED,
  carried_over DECIMAL(5,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_leave_bal ON leave_balances(tenant_id, employee_id, leave_type_id, year);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL, end_date DATE NOT NULL,
  days DECIMAL(5,1) NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by UUID, approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id),
  effective_from DATE NOT NULL,
  basic_salary DECIMAL(18,2) NOT NULL,
  components JSONB NOT NULL, -- [{name, type:'allowance'|'deduction', amount, is_percentage, percentage_of}]
  -- e.g., [{name:'Housing', type:'allowance', amount:3000}, {name:'Transport', type:'allowance', amount:1000}]
  gross_salary DECIMAL(18,2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID
);
CREATE INDEX idx_salary ON salary_structures(tenant_id, employee_id, is_current);

CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  payroll_number VARCHAR(50) NOT NULL,
  period_month INTEGER NOT NULL, period_year INTEGER NOT NULL,
  total_gross DECIMAL(18,2) DEFAULT 0,
  total_deductions DECIMAL(18,2) DEFAULT 0,
  total_net DECIMAL(18,2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, calculated, approved, posted, paid
  calculated_at TIMESTAMPTZ, approved_by UUID, approved_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ, journal_entry_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
CREATE UNIQUE INDEX idx_payroll_num ON payroll_runs(tenant_id, company_id, payroll_number);

CREATE TABLE payroll_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  basic_salary DECIMAL(18,2) NOT NULL,
  allowances JSONB, -- [{name, amount}]
  total_allowances DECIMAL(18,2) DEFAULT 0,
  gross_salary DECIMAL(18,2) NOT NULL,
  deductions JSONB, -- [{name, amount}] (tax, social insurance, advance, penalty)
  total_deductions DECIMAL(18,2) DEFAULT 0,
  net_salary DECIMAL(18,2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'bank_transfer',
  days_worked DECIMAL(5,1),
  overtime_hours DECIMAL(5,1) DEFAULT 0,
  overtime_amount DECIMAL(18,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payroll_lines ON payroll_lines(tenant_id, payroll_run_id);

CREATE TABLE employee_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id),
  amount DECIMAL(18,2) NOT NULL, currency_code VARCHAR(3) NOT NULL,
  reason TEXT, request_date DATE NOT NULL,
  repayment_method VARCHAR(20) DEFAULT 'salary_deduction', -- salary_deduction, lump_sum
  installments INTEGER DEFAULT 1,
  repaid_amount DECIMAL(18,2) DEFAULT 0,
  balance DECIMAL(18,2) GENERATED ALWAYS AS (amount - repaid_amount) STORED,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, active, repaid, cancelled
  approved_by UUID, approved_at TIMESTAMPTZ,
  journal_entry_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employee_custody (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id),
  asset_id UUID REFERENCES fixed_assets(id),
  item_name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(100),
  issued_date DATE NOT NULL, return_date DATE,
  condition_on_issue VARCHAR(100),
  condition_on_return VARCHAR(100),
  status VARCHAR(20) DEFAULT 'issued', -- issued, returned, lost, written_off
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_custody ON employee_custody(tenant_id, employee_id, status);
```

## Summary: Table Count

| Module | Tables |
|---|---|
| Platform Core | 18 (tenants, companies, branches, users, roles, user_roles, audit_logs, financial_event_log, approval_workflows, approval_requests, approval_actions, documents, settings, sequence_counters, notifications, currencies, exchange_rates, tax_rules) |
| Property Catalog | 9 (projects, phases, buildings, floors, units, unit_status_history, price_lists, price_list_items, promotions) |
| CRM & Sales | 10 (leads, lead_activities, campaigns, opportunities, quotations, brokers, broker_agreements, commissions, rfqs*, rfq_responses*) |
| Contracting | 6 (customers, customer_co_buyers, bookings, contracts, contract_addendums, refunds) |
| Collections | 5 (payment_plan_templates, payment_plans, installments, receipts, receipt_allocations, cheques, cheque_status_history, dunning_actions) |
| Finance | 18 (chart_of_accounts, fiscal_periods, cost_centers, journal_entries, journal_lines, accounting_rules, bank_accounts, cashboxes, bank_transactions, bank_reconciliations, bank_reconciliation_lines, revenue_recognition_schedules, revenue_recognition_entries, vendor_bills, vendor_bill_lines, vendor_payments, fixed_assets, depreciation_entries, budgets, budget_lines) |
| Procurement | 8 (vendors, purchase_requisitions, pr_lines, rfqs, rfq_responses, purchase_orders, po_lines, grns, grn_lines) |
| Inventory | 6 (warehouses, warehouse_locations, items, stock_movements, stock_balances, inventory_counts, inventory_count_lines) |
| Project Costing | 7 (wbs_items, wbs_budgets, contractors, contractor_contracts, progress_claims, claim_lines, change_orders, site_overhead_allocations) |
| Handover | 9 (handover_checklists, handovers, handover_items, snag_lists, snag_items, maintenance_tickets, ticket_activities, maintenance_deposits, maintenance_deposit_transactions) |
| HR/Payroll | 11 (departments, employees, attendance, leave_types, leave_balances, leave_requests, salary_structures, payroll_runs, payroll_lines, employee_advances, employee_custody) |
| **Total** | **~130** |
