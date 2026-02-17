-- Find tables missing updated_by column (entities expect it via BaseEntity)
SELECT t.table_name,
  EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') as has_created_by,
  EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') as has_updated_by,
  EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'deleted_at' AND c.table_schema = 'public') as has_deleted_at,
  EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'version' AND c.table_schema = 'public') as has_version,
  EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') as has_tenant_id
FROM information_schema.tables t
WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN ('typeorm_metadata', 'migrations')
ORDER BY t.table_name;
