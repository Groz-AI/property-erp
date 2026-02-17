-- Full schema check: which columns exist in each table
SELECT table_name, string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT IN ('typeorm_metadata', 'migrations')
GROUP BY table_name
ORDER BY table_name;
