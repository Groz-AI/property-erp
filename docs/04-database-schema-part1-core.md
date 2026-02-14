# Database Schema — Part 1: Core & Property Tables

## Design Conventions
- **PKs**: UUID v7, column `id`
- **Tenant**: `tenant_id UUID NOT NULL` + RLS on every business table
- **Soft Deletes**: `deleted_at TIMESTAMPTZ`
- **Temporal**: `created_at`, `updated_at` TIMESTAMPTZ DEFAULT NOW()
- **Audit**: `created_by UUID`, `updated_by UUID`
- **Optimistic Lock**: `version INTEGER DEFAULT 1` on concurrent entities
- **Naming**: snake_case, singular, `_id` for FKs
- **Indexes**: `(tenant_id, ...)` composite on all query paths

## Enums

```sql
CREATE TYPE unit_status AS ENUM ('available','soft_reserved','reserved','sold','blocked','under_maintenance','legal_hold','delivered','cancelled');
CREATE TYPE booking_status AS ENUM ('active','expired','converted','cancelled');
CREATE TYPE contract_status AS ENUM ('draft','under_review','signed','active','completed','cancelled','transferred');
CREATE TYPE installment_status AS ENUM ('upcoming','due','overdue','partially_paid','paid','waived','rescheduled');
CREATE TYPE installment_type AS ENUM ('down_payment','installment','balloon','handover','maintenance_deposit');
CREATE TYPE receipt_status AS ENUM ('draft','confirmed','reversed');
CREATE TYPE cheque_status AS ENUM ('received','under_collection','deposited','cleared','bounced','replaced','written_off');
CREATE TYPE payment_method AS ENUM ('cash','bank_transfer','cheque','credit_card','online_gateway');
CREATE TYPE journal_status AS ENUM ('draft','posted','reversed');
CREATE TYPE account_type AS ENUM ('asset','liability','equity','revenue','expense');
CREATE TYPE lead_status AS ENUM ('new','contacted','qualified','opportunity','won','lost','disqualified');
CREATE TYPE opportunity_stage AS ENUM ('discovery','proposal','negotiation','booking','won','lost');
CREATE TYPE approval_status AS ENUM ('pending','approved','rejected','escalated','cancelled');
CREATE TYPE po_status AS ENUM ('draft','pending_approval','approved','partially_received','received','closed','cancelled');
CREATE TYPE claim_status AS ENUM ('draft','submitted','under_review','approved','partially_paid','paid','rejected');
CREATE TYPE ticket_status AS ENUM ('open','assigned','in_progress','resolved','closed','reopened');
CREATE TYPE ticket_priority AS ENUM ('low','medium','high','critical');
CREATE TYPE commission_method AS ENUM ('fixed_amount','percentage','tiered','milestone');
CREATE TYPE commission_status AS ENUM ('calculated','pending_approval','approved','paid','cancelled');
CREATE TYPE refund_status AS ENUM ('requested','pending_approval','approved','paid','rejected');
CREATE TYPE handover_status AS ENUM ('pending','initial_inspection','snag_rectification','final_inspection','completed');
CREATE TYPE stock_movement_type AS ENUM ('receive','issue','transfer_in','transfer_out','adjustment_in','adjustment_out');
CREATE TYPE revenue_recognition_method AS ENUM ('delivery_based','percentage_of_completion','milestone_based');
CREATE TYPE booking_fee_type AS ENUM ('refundable','non_refundable','deducted_from_first');
```

## A) Platform Core

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  domain VARCHAR(255),
  logo_url VARCHAR(500),
  settings JSONB NOT NULL DEFAULT '{}',
  subscription_plan VARCHAR(50) DEFAULT 'standard',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  legal_name VARCHAR(255), tax_id VARCHAR(100),
  default_currency_code VARCHAR(3) DEFAULT 'USD',
  fiscal_year_start_month INTEGER DEFAULT 1,
  address JSONB, phone VARCHAR(50), email VARCHAR(255),
  logo_url VARCHAR(500), settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_companies_tenant ON companies(tenant_id) WHERE deleted_at IS NULL;

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  code VARCHAR(20), address JSONB, phone VARCHAR(50),
  manager_id UUID, settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_branches_tenant ON branches(tenant_id, company_id) WHERE deleted_at IS NULL;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
  first_name_ar VARCHAR(100), last_name_ar VARCHAR(100),
  phone VARCHAR(50), avatar_url VARCHAR(500),
  preferred_language VARCHAR(5) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true, is_system_admin BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ, last_login_ip VARCHAR(45),
  failed_login_count INTEGER DEFAULT 0, locked_until TIMESTAMPTZ,
  refresh_token_hash VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_tenant ON users(tenant_id) WHERE deleted_at IS NULL;

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL, name_ar VARCHAR(100),
  description TEXT, is_system BOOLEAN DEFAULT false,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_roles_name ON roles(tenant_id, name) WHERE deleted_at IS NULL;

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  company_id UUID REFERENCES companies(id),
  branch_id UUID REFERENCES branches(id),
  project_id UUID,
  assigned_by UUID, created_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_user_roles ON user_roles(tenant_id, user_id) WHERE deleted_at IS NULL;

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, user_id UUID,
  entity_type VARCHAR(100) NOT NULL, entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB, new_values JSONB,
  ip_address VARCHAR(45), user_agent TEXT, metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_audit_entity ON audit_logs(tenant_id, entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(tenant_id, user_id);

CREATE TABLE financial_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL, entity_id UUID NOT NULL,
  payload JSONB NOT NULL, checksum VARCHAR(64) NOT NULL,
  previous_hash VARCHAR(64), user_id UUID NOT NULL,
  ip_address VARCHAR(45), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_fin_event ON financial_event_log(tenant_id, entity_type, entity_id);

CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL, action_type VARCHAR(100) NOT NULL,
  conditions JSONB DEFAULT '[]', steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_approval_wf ON approval_workflows(tenant_id, action_type) WHERE deleted_at IS NULL;

CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, workflow_id UUID NOT NULL REFERENCES approval_workflows(id),
  entity_type VARCHAR(100), entity_id UUID,
  requested_by UUID NOT NULL REFERENCES users(id),
  status approval_status DEFAULT 'pending', current_step INTEGER DEFAULT 1,
  data_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_approval_req ON approval_requests(tenant_id, status);

CREATE TABLE approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, request_id UUID NOT NULL REFERENCES approval_requests(id),
  step_number INTEGER, actor_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(20) NOT NULL, comment TEXT,
  delegated_to UUID, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, entity_type VARCHAR(100), entity_id UUID,
  file_name VARCHAR(500) NOT NULL, file_type VARCHAR(100), file_size BIGINT,
  storage_key VARCHAR(500) NOT NULL, version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES documents(id), tags VARCHAR(100)[],
  description TEXT, access_level VARCHAR(20) DEFAULT 'private',
  uploaded_by UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_documents ON documents(tenant_id, entity_type, entity_id) WHERE deleted_at IS NULL;

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, scope_type VARCHAR(50) NOT NULL,
  scope_id UUID, key VARCHAR(200) NOT NULL, value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sequence_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, company_id UUID,
  document_type VARCHAR(50) NOT NULL, prefix VARCHAR(20),
  current_value BIGINT DEFAULT 0, fiscal_year INTEGER,
  pattern VARCHAR(100) DEFAULT '{prefix}-{year}-{seq:5}'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, user_id UUID NOT NULL,
  title VARCHAR(255), body TEXT, link VARCHAR(500),
  is_read BOOLEAN DEFAULT false, channel VARCHAR(20) DEFAULT 'in_app',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notif ON notifications(tenant_id, user_id, is_read);

CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, code VARCHAR(3) NOT NULL,
  name VARCHAR(100), name_ar VARCHAR(100), symbol VARCHAR(10),
  decimal_places INTEGER DEFAULT 2, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_currencies ON currencies(tenant_id, code);

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL, rate DECIMAL(18,8) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_exchange_rates ON exchange_rates(tenant_id, from_currency, to_currency, effective_date);

CREATE TABLE tax_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100), tax_type VARCHAR(50) NOT NULL,
  rate DECIMAL(8,4) NOT NULL, is_inclusive BOOLEAN DEFAULT false,
  effective_from DATE, effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tax_rules ON tax_rules(tenant_id, tax_type) WHERE is_active;
```

## B) Property Catalog

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255),
  code VARCHAR(50) NOT NULL, description TEXT,
  project_type VARCHAR(50), location JSONB,
  total_area DECIMAL(15,2), total_units INTEGER,
  expected_start DATE, expected_end DATE,
  completion_pct DECIMAL(5,2) DEFAULT 0,
  revenue_recognition_method revenue_recognition_method DEFAULT 'delivery_based',
  default_price_per_sqm DECIMAL(15,2),
  default_currency_code VARCHAR(3) DEFAULT 'USD',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX idx_projects_code ON projects(tenant_id, code) WHERE deleted_at IS NULL;

CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, project_id UUID NOT NULL REFERENCES projects(id),
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255), code VARCHAR(50),
  sort_order INTEGER DEFAULT 0, price_per_sqm_override DECIMAL(15,2),
  expected_delivery DATE, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);

CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, phase_id UUID NOT NULL REFERENCES phases(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  name VARCHAR(255) NOT NULL, name_ar VARCHAR(255), code VARCHAR(50),
  total_floors INTEGER, price_per_sqm_override DECIMAL(15,2),
  sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);

CREATE TABLE floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, building_id UUID NOT NULL REFERENCES buildings(id),
  project_id UUID NOT NULL, name VARCHAR(100), floor_number INTEGER NOT NULL,
  price_per_sqm_override DECIMAL(15,2), sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, project_id UUID NOT NULL REFERENCES projects(id),
  phase_id UUID NOT NULL, building_id UUID NOT NULL, floor_id UUID NOT NULL,
  unit_code VARCHAR(100) NOT NULL,
  unit_type VARCHAR(50) NOT NULL, status unit_status DEFAULT 'available',
  bedrooms INTEGER, bathrooms INTEGER,
  built_up_area DECIMAL(12,2), land_area DECIMAL(12,2),
  garden_area DECIMAL(12,2), terrace_area DECIMAL(12,2), roof_area DECIMAL(12,2),
  total_area DECIMAL(12,2) NOT NULL,
  orientation VARCHAR(10), view_type VARCHAR(50), finishing_level VARCHAR(50),
  floor_number INTEGER,
  price_per_sqm DECIMAL(15,2), total_price DECIMAL(18,2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'USD',
  description TEXT, description_ar TEXT,
  features JSONB, gallery JSONB, geo_location JSONB,
  soft_reserved_until TIMESTAMPTZ, soft_reserved_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, updated_by UUID, deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX idx_units_code ON units(tenant_id, project_id, unit_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_units_status ON units(tenant_id, project_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_units_avail ON units(tenant_id, total_price) WHERE deleted_at IS NULL AND status='available';

CREATE TABLE unit_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, unit_id UUID NOT NULL REFERENCES units(id),
  old_status unit_status, new_status unit_status NOT NULL,
  reason TEXT, reference_type VARCHAR(50), reference_id UUID,
  changed_by UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_unit_hist ON unit_status_history(tenant_id, unit_id);

CREATE TABLE price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, name VARCHAR(255), project_id UUID,
  effective_from DATE NOT NULL, effective_to DATE, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID, deleted_at TIMESTAMPTZ
);

CREATE TABLE price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, price_list_id UUID NOT NULL REFERENCES price_lists(id),
  unit_id UUID, building_id UUID, unit_type VARCHAR(50),
  price_per_sqm DECIMAL(15,2), total_price DECIMAL(18,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, name VARCHAR(255) NOT NULL,
  discount_type VARCHAR(20) NOT NULL, discount_value DECIMAL(15,2),
  max_discount DECIMAL(15,2),
  applicable_projects UUID[], applicable_unit_types VARCHAR(50)[],
  valid_from TIMESTAMPTZ, valid_to TIMESTAMPTZ,
  requires_approval BOOLEAN DEFAULT false, approval_threshold DECIMAL(5,2),
  max_usage INTEGER, usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, deleted_at TIMESTAMPTZ
);
```
