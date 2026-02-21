-- Check demo@grozai.net user permissions
SELECT u.id, u.email, u.is_system_admin, u.is_active, u.tenant_id
FROM users u WHERE u.email = 'demo@grozai.net';

-- Check all users and their roles
SELECT u.email, u.is_system_admin, u.is_active, array_agg(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.tenant_id = (SELECT tenant_id FROM users WHERE email = 'demo@grozai.net' LIMIT 1)
GROUP BY u.email, u.is_system_admin, u.is_active
ORDER BY u.email;

-- Check what permissions demo@grozai.net has via roles
SELECT DISTINCT unnest(r.permissions) as permission
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = (SELECT id FROM users WHERE email = 'demo@grozai.net')
ORDER BY permission;

-- Check companies for this tenant
SELECT id, name, is_active FROM companies
WHERE tenant_id = (SELECT tenant_id FROM users WHERE email = 'demo@grozai.net' LIMIT 1);
