-- Check permissions for demo@grozai.net (jsonb array)
SELECT DISTINCT perm
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id,
jsonb_array_elements_text(r.permissions) AS perm
WHERE ur.user_id = (SELECT id FROM users WHERE email = 'demo@grozai.net')
ORDER BY perm;

-- Create default company for demo tenant if none exists
INSERT INTO companies (id, tenant_id, name, default_currency, is_active, settings, created_at, updated_at)
SELECT gen_random_uuid(),
       '33978b1e-313f-4200-9854-f7127bc9275a',
       'Groz AI',
       'AED',
       true,
       '{}',
       now(),
       now()
WHERE NOT EXISTS (
  SELECT 1 FROM companies WHERE tenant_id = '33978b1e-313f-4200-9854-f7127bc9275a'
);

-- Verify company was created
SELECT id, name, is_active FROM companies
WHERE tenant_id = '33978b1e-313f-4200-9854-f7127bc9275a';
