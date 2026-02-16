DO $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
  v_role_id uuid;
  v_company_id uuid;
BEGIN
  SELECT id, tenant_id INTO v_user_id, v_tenant_id
  FROM users WHERE email = 'admin@test.com';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User admin@test.com not found';
    RETURN;
  END IF;
  
  RAISE NOTICE 'User ID: %, Tenant ID: %', v_user_id, v_tenant_id;

  IF NOT EXISTS (SELECT 1 FROM roles WHERE tenant_id = v_tenant_id) THEN
    RAISE NOTICE 'Creating default roles...';
    INSERT INTO roles (tenant_id, name, permissions, is_system) VALUES
      (v_tenant_id, 'Tenant Admin', '["*"]', true),
      (v_tenant_id, 'Sales Manager', '["leads:*","opportunities:*","bookings:*","contracts:*","customers:*","units:read","commissions:*","reports:sales"]', true),
      (v_tenant_id, 'Sales Agent', '["leads:read","leads:create","leads:update","bookings:create","bookings:read","customers:create","customers:read","units:read"]', true),
      (v_tenant_id, 'Finance Manager', '["accounting:*","receipts:*","cheques:*","refunds:*","contracts:read","reports:finance"]', true),
      (v_tenant_id, 'Accountant', '["accounting:read","accounting:create","receipts:*","cheques:*","reports:finance"]', true),
      (v_tenant_id, 'Cashier', '["receipts:create","receipts:read","cheques:read"]', true),
      (v_tenant_id, 'Procurement Manager', '["procurement:*","inventory:*","vendors:*"]', true),
      (v_tenant_id, 'Construction Manager', '["contractors:*","claims:*","wbs:*","projects:read"]', true),
      (v_tenant_id, 'Handover Officer', '["handover:*","maintenance:*","units:read","contracts:read"]', true),
      (v_tenant_id, 'HR Manager', '["hr:*","payroll:*"]', true);
    RAISE NOTICE 'Created 10 default roles';
  ELSE
    RAISE NOTICE 'Roles already exist for tenant';
  END IF;

  SELECT id INTO v_role_id FROM roles WHERE tenant_id = v_tenant_id AND name = 'Tenant Admin';
  RAISE NOTICE 'Tenant Admin role ID: %', v_role_id;

  INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_role_id) ON CONFLICT DO NOTHING;
  RAISE NOTICE 'Assigned Tenant Admin role to admin@test.com';

  SELECT id INTO v_company_id FROM companies WHERE tenant_id = v_tenant_id LIMIT 1;
  IF v_company_id IS NULL THEN
    INSERT INTO companies (tenant_id, name, default_currency)
    VALUES (v_tenant_id, 'Default Company', 'AED')
    RETURNING id INTO v_company_id;
    RAISE NOTICE 'Created default company: %', v_company_id;
  ELSE
    RAISE NOTICE 'Company already exists: %', v_company_id;
  END IF;
END $$;
