-- ══════════════════════════════════════════════════════════════
-- Comprehensive migration: add ALL missing columns to production DB
-- Entities extend BaseEntity which expects: created_by, updated_by, deleted_at
-- ══════════════════════════════════════════════════════════════

-- ── approval_requests: missing created_by, updated_by, deleted_at + entity columns ──
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50);
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS requested_by UUID;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS comments TEXT;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS resolved_by UUID;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ── bookings: missing updated_by, deleted_at ──
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── branches: missing created_by, updated_by + entity columns ──
ALTER TABLE branches ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ── chart_of_accounts: missing created_by, updated_by, deleted_at + entity columns ──
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS normal_balance VARCHAR(10) DEFAULT 'debit';

-- ── companies: missing created_by, updated_by ──
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_by UUID;

-- ── contracts: missing deleted_at ──
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── customers: missing updated_by ──
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_by UUID;

-- ── journal_entries: missing updated_by, deleted_at ──
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── leads: missing updated_by ──
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_by UUID;

-- ── receipts: missing updated_by, deleted_at ──
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── brokers: add deleted_at if missing (entity extends BaseEntity) ──
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── contractors: add deleted_at if missing ──
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── vendors: add deleted_at if missing ──
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── items (inventory): add deleted_at if missing ──
ALTER TABLE items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── bank_accounts: add deleted_at if missing ──
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ── maintenance_tickets: ensure all columns exist ──
-- (already has created_by, updated_by, deleted_at per check)

-- ── documents: missing created_by, updated_by ──
ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_by UUID;

-- ══════════════════════════════════════════════════════════════
-- Also ensure approval_requests has proper enum type for status
-- ══════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════
-- Verify: count columns added
-- ══════════════════════════════════════════════════════════════
SELECT 'MIGRATION COMPLETE' as result;

-- Recheck missing columns
SELECT table_name,
  bool_or(column_name = 'created_by') as has_created_by,
  bool_or(column_name = 'updated_by') as has_updated_by,
  bool_or(column_name = 'deleted_at') as has_deleted_at
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'approval_requests', 'bookings', 'branches', 'chart_of_accounts',
    'companies', 'contracts', 'customers', 'journal_entries',
    'leads', 'receipts', 'brokers', 'contractors', 'vendors', 'items',
    'bank_accounts', 'documents'
  )
GROUP BY table_name
ORDER BY table_name;
