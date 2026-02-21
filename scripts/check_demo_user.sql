-- List all users in the demo tenant
SELECT id, email, is_active, is_system_admin, created_at
FROM users
WHERE tenant_id = '33978b1e-313f-4200-9854-f7127bc9275a'
ORDER BY created_at;

-- Also check all tenants
SELECT id, name, slug FROM tenants ORDER BY created_at;

-- Check all users across all tenants
SELECT u.email, t.name as tenant_name, u.is_active, u.is_system_admin
FROM users u
LEFT JOIN tenants t ON t.id = u.tenant_id
ORDER BY t.name, u.email;
