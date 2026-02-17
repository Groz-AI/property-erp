-- Verify admin@test.com has correct setup
SELECT u.email, u.tenant_id, u.is_system_admin, u.is_active,
       r.name as role_name, r.permissions
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@test.com';

-- Check company exists for this tenant
SELECT c.id, c.name, c.tenant_id 
FROM companies c 
WHERE c.tenant_id = (SELECT tenant_id FROM users WHERE email = 'admin@test.com');
