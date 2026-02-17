-- Check which tables are missing created_by/updated_by columns
SELECT table_name,
  bool_or(column_name = 'created_by') as has_created_by,
  bool_or(column_name = 'updated_by') as has_updated_by,
  bool_or(column_name = 'deleted_at') as has_deleted_at
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'customers', 'leads', 'bookings', 'contracts', 'projects', 'units',
    'employees', 'brokers', 'contractors', 'receipts', 'handovers',
    'maintenance_tickets', 'vendors', 'purchase_orders', 'inventory_items',
    'chart_of_accounts', 'journal_entries', 'companies', 'branches',
    'bank_accounts', 'fixed_assets', 'ap_invoices', 'approval_requests',
    'refunds', 'progress_claims', 'payslips', 'phases', 'buildings',
    'notifications', 'documents'
  )
GROUP BY table_name
ORDER BY table_name;

-- Show all columns for customers table as a reference
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customers'
ORDER BY ordinal_position;

-- Show all columns for leads table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'leads'
ORDER BY ordinal_position;

-- Show all columns for brokers table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'brokers'
ORDER BY ordinal_position;

-- Show all columns for companies table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'companies'
ORDER BY ordinal_position;

-- Show columns for projects table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;
