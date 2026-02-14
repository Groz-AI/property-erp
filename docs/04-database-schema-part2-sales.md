# Database Schema — Part 2: CRM, Sales, Contracting, Collections

## C) CRM & Sales

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL REFERENCES companies(id),
  first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100),
  first_name_ar VARCHAR(100), last_name_ar VARCHAR(100),
  email VARCHAR(255), phone VARCHAR(50) NOT NULL, phone_alt VARCHAR(50),
  source VARCHAR(50), channel VARCHAR(50),
  campaign_id UUID REFERENCES campaigns(id),
  interested_project_id UUID, interested_unit_type VARCHAR(50),
  budget_min DECIMAL(18,2), budget_max DECIMAL(18,2),
  status lead_status DEFAULT 'new', score INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES users(id), assigned_at TIMESTAMPTZ,
  first_contact_at TIMESTAMPTZ, notes TEXT, tags VARCHAR(100)[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_leads_status ON leads(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_assigned ON leads(tenant_id, assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_phone ON leads(tenant_id, phone) WHERE deleted_at IS NULL;

CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, lead_id UUID NOT NULL REFERENCES leads(id),
  activity_type VARCHAR(50) NOT NULL, subject VARCHAR(255),
  description TEXT, outcome VARCHAR(100),
  scheduled_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
  performed_by UUID, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_lead_act ON lead_activities(tenant_id, lead_id);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, name VARCHAR(255) NOT NULL,
  channel VARCHAR(50), budget DECIMAL(18,2), actual_cost DECIMAL(18,2) DEFAULT 0,
  start_date DATE, end_date DATE, target_project_id UUID,
  lead_count INTEGER DEFAULT 0, booking_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  lead_id UUID REFERENCES leads(id), customer_id UUID,
  unit_id UUID, stage opportunity_stage DEFAULT 'discovery',
  expected_amount DECIMAL(18,2), probability INTEGER DEFAULT 50,
  expected_close DATE, assigned_to UUID, notes TEXT, lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_opp_stage ON opportunities(tenant_id, stage) WHERE deleted_at IS NULL;

CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, quotation_number VARCHAR(50) NOT NULL,
  opportunity_id UUID, customer_id UUID, unit_id UUID NOT NULL,
  unit_price DECIMAL(18,2) NOT NULL, discount_type VARCHAR(20),
  discount_value DECIMAL(15,2), discount_amount DECIMAL(18,2) DEFAULT 0,
  net_price DECIMAL(18,2) NOT NULL, currency_code VARCHAR(3) NOT NULL,
  payment_plan_template_id UUID, price_frozen_until TIMESTAMPTZ,
  version INTEGER DEFAULT 1, status VARCHAR(20) DEFAULT 'draft',
  valid_until TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_quot_num ON quotations(tenant_id, quotation_number) WHERE deleted_at IS NULL;

CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_name VARCHAR(255) NOT NULL,
  company_name_ar VARCHAR(255), contact_name VARCHAR(255),
  email VARCHAR(255), phone VARCHAR(50), license_number VARCHAR(100),
  tax_id VARCHAR(100), bank_details JSONB, address JSONB,
  rating INTEGER, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);

CREATE TABLE broker_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, broker_id UUID NOT NULL REFERENCES brokers(id),
  agreement_number VARCHAR(50) NOT NULL, project_ids UUID[],
  commission_method commission_method NOT NULL,
  commission_value DECIMAL(15,4), commission_tiers JSONB,
  commission_milestones JSONB, withholding_tax_rate DECIMAL(5,2) DEFAULT 0,
  valid_from DATE NOT NULL, valid_to DATE, terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, broker_id UUID NOT NULL REFERENCES brokers(id),
  agreement_id UUID NOT NULL, contract_id UUID, booking_id UUID,
  trigger_event VARCHAR(50) NOT NULL,
  gross_amount DECIMAL(18,2) NOT NULL, withholding_tax DECIMAL(18,2) DEFAULT 0,
  net_amount DECIMAL(18,2) NOT NULL, currency_code VARCHAR(3) NOT NULL,
  status commission_status DEFAULT 'calculated',
  approved_by UUID, approved_at TIMESTAMPTZ, paid_at TIMESTAMPTZ,
  payment_reference VARCHAR(100), notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_comm_broker ON commissions(tenant_id, broker_id);
CREATE INDEX idx_comm_status ON commissions(tenant_id, status);
```

## D) Contracting

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, customer_number VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
  first_name_ar VARCHAR(100), last_name_ar VARCHAR(100),
  email VARCHAR(255), phone VARCHAR(50) NOT NULL, phone_alt VARCHAR(50),
  nationality VARCHAR(3), id_type VARCHAR(50), id_number VARCHAR(100),
  id_expiry DATE, date_of_birth DATE, gender VARCHAR(10),
  address JSONB, employer VARCHAR(255), occupation VARCHAR(255),
  annual_income DECIMAL(18,2),
  verification_status VARCHAR(20) DEFAULT 'pending',
  risk_flags JSONB, notes TEXT, metadata JSONB,
  lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_cust_num ON customers(tenant_id, customer_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_cust_phone ON customers(tenant_id, phone) WHERE deleted_at IS NULL;

CREATE TABLE customer_co_buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, customer_id UUID NOT NULL REFERENCES customers(id),
  co_buyer_customer_id UUID NOT NULL REFERENCES customers(id),
  ownership_pct DECIMAL(5,2) DEFAULT 50, relationship VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  booking_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  project_id UUID NOT NULL, opportunity_id UUID, broker_id UUID,
  unit_price DECIMAL(18,2) NOT NULL, discount_amount DECIMAL(18,2) DEFAULT 0,
  net_price DECIMAL(18,2) NOT NULL, currency_code VARCHAR(3) NOT NULL,
  booking_fee DECIMAL(18,2) DEFAULT 0,
  booking_fee_type booking_fee_type DEFAULT 'deducted_from_first',
  payment_plan_template_id UUID,
  status booking_status DEFAULT 'active',
  valid_until TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ, cancellation_reason TEXT,
  cancellation_fee DECIMAL(18,2) DEFAULT 0,
  notes TEXT, sales_agent_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX idx_book_num ON bookings(tenant_id, booking_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_book_cust ON bookings(tenant_id, customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_book_unit ON bookings(tenant_id, unit_id) WHERE deleted_at IS NULL;

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  contract_number VARCHAR(50) NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  project_id UUID NOT NULL, broker_id UUID,
  contract_date DATE NOT NULL,
  unit_price DECIMAL(18,2) NOT NULL, discount_amount DECIMAL(18,2) DEFAULT 0,
  net_price DECIMAL(18,2) NOT NULL, tax_amount DECIMAL(18,2) DEFAULT 0,
  total_amount DECIMAL(18,2) NOT NULL, currency_code VARCHAR(3) NOT NULL,
  payment_plan_id UUID,
  expected_delivery DATE, warranty_months INTEGER DEFAULT 12,
  maintenance_deposit DECIMAL(18,2) DEFAULT 0,
  status contract_status DEFAULT 'draft',
  signed_at TIMESTAMPTZ, delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ, cancellation_reason TEXT,
  transfer_from_contract_id UUID,
  terms JSONB, notes TEXT, sales_agent_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX idx_contr_num ON contracts(tenant_id, contract_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_contr_cust ON contracts(tenant_id, customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contr_unit ON contracts(tenant_id, unit_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contr_status ON contracts(tenant_id, status) WHERE deleted_at IS NULL;

CREATE TABLE contract_addendums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, contract_id UUID NOT NULL REFERENCES contracts(id),
  addendum_number VARCHAR(50) NOT NULL,
  addendum_type VARCHAR(50) NOT NULL, description TEXT NOT NULL,
  old_values JSONB, new_values JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  approved_by UUID, approved_at TIMESTAMPTZ, signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID
);
```

## E) Installments & Collections

```sql
CREATE TABLE payment_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  project_id UUID, description TEXT,
  components JSONB NOT NULL,
  grace_period_days INTEGER DEFAULT 0,
  penalty_type VARCHAR(20), penalty_value DECIMAL(15,4), penalty_cap DECIMAL(18,2),
  rounding_rule VARCHAR(20) DEFAULT 'nearest_10',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, contract_id UUID NOT NULL REFERENCES contracts(id),
  template_id UUID, total_amount DECIMAL(18,2) NOT NULL,
  down_payment DECIMAL(18,2) DEFAULT 0,
  installments_total DECIMAL(18,2) DEFAULT 0,
  handover_amount DECIMAL(18,2) DEFAULT 0,
  maintenance_deposit DECIMAL(18,2) DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL,
  grace_period_days INTEGER DEFAULT 0,
  penalty_type VARCHAR(20), penalty_value DECIMAL(15,4), penalty_cap DECIMAL(18,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);
CREATE INDEX idx_pp_contract ON payment_plans(tenant_id, contract_id);

CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, payment_plan_id UUID NOT NULL REFERENCES payment_plans(id),
  contract_id UUID NOT NULL, customer_id UUID NOT NULL,
  installment_number INTEGER NOT NULL,
  installment_type installment_type NOT NULL,
  due_date DATE NOT NULL, amount DECIMAL(18,2) NOT NULL,
  paid_amount DECIMAL(18,2) DEFAULT 0,
  penalty_amount DECIMAL(18,2) DEFAULT 0, penalty_paid DECIMAL(18,2) DEFAULT 0,
  waived_amount DECIMAL(18,2) DEFAULT 0,
  balance DECIMAL(18,2) GENERATED ALWAYS AS (amount - paid_amount - waived_amount) STORED,
  currency_code VARCHAR(3) NOT NULL,
  status installment_status DEFAULT 'upcoming',
  rescheduled_from UUID, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);
CREATE INDEX idx_inst_contract ON installments(tenant_id, contract_id);
CREATE INDEX idx_inst_due ON installments(tenant_id, due_date, status)
  WHERE status IN ('upcoming','due','overdue','partially_paid');

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  receipt_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL, contract_id UUID, booking_id UUID,
  amount DECIMAL(18,2) NOT NULL, currency_code VARCHAR(3) NOT NULL,
  payment_method payment_method NOT NULL,
  reference_number VARCHAR(100), payment_date DATE NOT NULL,
  bank_account_id UUID, cashbox_id UUID, cheque_id UUID,
  status receipt_status DEFAULT 'draft',
  journal_entry_id UUID, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX idx_rcpt_num ON receipts(tenant_id, receipt_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_rcpt_cust ON receipts(tenant_id, customer_id) WHERE deleted_at IS NULL;

CREATE TABLE receipt_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, receipt_id UUID NOT NULL REFERENCES receipts(id),
  installment_id UUID NOT NULL REFERENCES installments(id),
  amount DECIMAL(18,2) NOT NULL, penalty_amount DECIMAL(18,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_alloc_receipt ON receipt_allocations(tenant_id, receipt_id);
CREATE INDEX idx_alloc_inst ON receipt_allocations(tenant_id, installment_id);

CREATE TABLE cheques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, receipt_id UUID REFERENCES receipts(id),
  cheque_number VARCHAR(50) NOT NULL,
  bank_name VARCHAR(255), branch_name VARCHAR(255),
  amount DECIMAL(18,2) NOT NULL, currency_code VARCHAR(3) NOT NULL,
  issue_date DATE, due_date DATE,
  drawer_name VARCHAR(255), drawer_account VARCHAR(100),
  status cheque_status DEFAULT 'received',
  deposited_to_bank_id UUID, deposited_at TIMESTAMPTZ,
  cleared_at TIMESTAMPTZ, bounced_at TIMESTAMPTZ,
  bounce_reason TEXT, replacement_cheque_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_cheques_status ON cheques(tenant_id, status);
CREATE INDEX idx_cheques_due ON cheques(tenant_id, due_date) WHERE status IN ('received','under_collection');

CREATE TABLE cheque_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, cheque_id UUID NOT NULL REFERENCES cheques(id),
  old_status cheque_status, new_status cheque_status NOT NULL,
  reason TEXT, changed_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID NOT NULL,
  refund_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL, contract_id UUID, booking_id UUID,
  reason TEXT NOT NULL,
  total_paid DECIMAL(18,2) NOT NULL,
  penalty_amount DECIMAL(18,2) DEFAULT 0,
  admin_fee DECIMAL(18,2) DEFAULT 0,
  refund_amount DECIMAL(18,2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  refund_method payment_method,
  bank_details JSONB,
  status refund_status DEFAULT 'requested',
  approved_by UUID, approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ, payment_reference VARCHAR(100),
  journal_entry_id UUID, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
CREATE INDEX idx_refund_cust ON refunds(tenant_id, customer_id);
CREATE INDEX idx_refund_status ON refunds(tenant_id, status);

CREATE TABLE dunning_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, customer_id UUID NOT NULL,
  contract_id UUID NOT NULL, installment_id UUID,
  action_type VARCHAR(50) NOT NULL, channel VARCHAR(20),
  message TEXT, outcome VARCHAR(100),
  next_action_date DATE, performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_dunning ON dunning_actions(tenant_id, customer_id, contract_id);
```
