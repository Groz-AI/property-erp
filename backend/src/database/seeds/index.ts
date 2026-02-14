import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 're_erp',
    username: process.env.DB_USER || 'erp_user',
    password: process.env.DB_PASSWORD || 'erp_pass',
  });

  await ds.initialize();
  const qr = ds.createQueryRunner();
  console.log('🌱 Seeding database...');

  try {
    // ============================================================
    // 1. TENANT
    // ============================================================
    const [tenant] = await qr.query(`
      INSERT INTO tenants (name, slug, is_active)
      VALUES ('Groz Real Estate Group', 'groz', true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    const tenantId = tenant.id;
    console.log(`  ✅ Tenant: ${tenantId}`);

    // ============================================================
    // 2. COMPANIES & BRANCHES
    // ============================================================
    const [company1] = await qr.query(`
      INSERT INTO companies (tenant_id, name, name_ar, default_currency)
      VALUES ($1, 'Groz Residential Development LLC', 'شركة غروز للتطوير السكني', 'AED')
      ON CONFLICT DO NOTHING RETURNING id
    `, [tenantId]);
    const comp1Id = company1?.id || (await qr.query(`SELECT id FROM companies WHERE tenant_id=$1 AND name='Groz Residential Development LLC'`, [tenantId]))[0].id;

    const [company2] = await qr.query(`
      INSERT INTO companies (tenant_id, name, name_ar, default_currency)
      VALUES ($1, 'Groz Commercial Properties LLC', 'شركة غروز للعقارات التجارية', 'AED')
      ON CONFLICT DO NOTHING RETURNING id
    `, [tenantId]);
    const comp2Id = company2?.id || (await qr.query(`SELECT id FROM companies WHERE tenant_id=$1 AND name='Groz Commercial Properties LLC'`, [tenantId]))[0].id;

    const branchInsert = `INSERT INTO branches (tenant_id, company_id, name, code, city, country) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING RETURNING id`;
    const [hqBranch] = await qr.query(branchInsert, [tenantId, comp1Id, 'Head Office', 'HQ', 'Dubai', 'AE']);
    const hqId = hqBranch?.id || (await qr.query(`SELECT id FROM branches WHERE tenant_id=$1 AND code='HQ'`, [tenantId]))[0].id;
    await qr.query(branchInsert, [tenantId, comp1Id, 'Abu Dhabi Office', 'AD', 'Abu Dhabi', 'AE']);
    await qr.query(branchInsert, [tenantId, comp2Id, 'Head Office Commercial', 'HQC', 'Dubai', 'AE']);
    console.log('  ✅ Companies & Branches');

    // ============================================================
    // 3a. PLATFORM SUPER ADMIN (no tenant — manages all tenants)
    // ============================================================
    const passwordHash = await bcrypt.hash('Demo@2026!', 12);
    await qr.query(`
      INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, is_system_admin, is_active, email_verified)
      VALUES (NULL, 'superadmin@grozai.net', $1, 'Platform', 'Admin', true, true, true)
      ON CONFLICT (email) DO UPDATE SET password_hash = $1, is_system_admin = true
    `, [passwordHash]);
    console.log('  ✅ Platform Super Admin (superadmin@grozai.net)');

    // ============================================================
    // 3b. TENANT USERS
    // ============================================================
    const users = [
      { email: 'ahmad@groz.ae', first: 'Ahmad', last: 'Al-Rashid', admin: true },
      { email: 'sarah@groz.ae', first: 'Sarah', last: 'Mitchell', admin: false },
      { email: 'omar@groz.ae', first: 'Omar', last: 'Hassan', admin: false },
      { email: 'fatima@groz.ae', first: 'Fatima', last: 'Al-Zahra', admin: false },
      { email: 'david@groz.ae', first: 'David', last: 'Chen', admin: false },
      { email: 'layla@groz.ae', first: 'Layla', last: 'Ibrahim', admin: false },
      { email: 'moh@groz.ae', first: 'Mohammed', last: 'Ali', admin: false },
      { email: 'priya@groz.ae', first: 'Priya', last: 'Sharma', admin: false },
      { email: 'james@groz.ae', first: 'James', last: 'Wilson', admin: false },
      { email: 'nour@groz.ae', first: 'Nour', last: 'El-Din', admin: false },
      { email: 'rania@groz.ae', first: 'Rania', last: 'Khalil', admin: false },
      { email: 'karim@groz.ae', first: 'Karim', last: 'Youssef', admin: false },
    ];
    for (const u of users) {
      await qr.query(`
        INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, is_system_admin, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, true, true)
        ON CONFLICT (email) DO UPDATE SET password_hash = $3
      `, [tenantId, u.email, passwordHash, u.first, u.last, u.admin]);
    }
    console.log('  ✅ Users (12)');

    // ============================================================
    // 4. ROLES
    // ============================================================
    const roles = [
      { name: 'Tenant Admin', perms: ['*'] },
      { name: 'Sales Manager', perms: ['leads:*', 'opportunities:*', 'bookings:*', 'contracts:*', 'customers:*', 'units:read', 'commissions:*', 'reports:sales'] },
      { name: 'Sales Agent', perms: ['leads:read', 'leads:create', 'leads:update', 'opportunities:*', 'bookings:create', 'bookings:read', 'customers:create', 'customers:read', 'units:read'] },
      { name: 'Finance Manager', perms: ['accounting:*', 'receipts:*', 'cheques:*', 'refunds:*', 'contracts:read', 'reports:finance'] },
      { name: 'Accountant', perms: ['accounting:read', 'accounting:create', 'receipts:*', 'cheques:*', 'reports:finance'] },
      { name: 'Cashier', perms: ['receipts:create', 'receipts:read', 'cheques:read'] },
      { name: 'Procurement Manager', perms: ['procurement:*', 'inventory:*', 'vendors:*'] },
      { name: 'Construction Manager', perms: ['contractors:*', 'claims:*', 'wbs:*', 'projects:read'] },
      { name: 'Handover Officer', perms: ['handover:*', 'maintenance:*', 'units:read', 'contracts:read'] },
      { name: 'HR Manager', perms: ['hr:*', 'payroll:*'] },
    ];
    for (const r of roles) {
      await qr.query(`
        INSERT INTO roles (tenant_id, name, permissions, is_system)
        VALUES ($1, $2, $3, true)
        ON CONFLICT DO NOTHING
      `, [tenantId, r.name, JSON.stringify(r.perms)]);
    }
    console.log('  ✅ Roles (10)');

    // ============================================================
    // 5. CURRENCIES & TAX RULES
    // ============================================================
    await qr.query(`INSERT INTO currencies (tenant_id, code, name, symbol, decimal_places, is_default) VALUES ($1, 'AED', 'UAE Dirham', 'د.إ', 2, true) ON CONFLICT DO NOTHING`, [tenantId]);
    await qr.query(`INSERT INTO currencies (tenant_id, code, name, symbol, decimal_places) VALUES ($1, 'USD', 'US Dollar', '$', 2) ON CONFLICT DO NOTHING`, [tenantId]);
    await qr.query(`INSERT INTO currencies (tenant_id, code, name, symbol, decimal_places) VALUES ($1, 'EUR', 'Euro', '€', 2) ON CONFLICT DO NOTHING`, [tenantId]);

    await qr.query(`INSERT INTO exchange_rates (tenant_id, from_currency, to_currency, rate, effective_date) VALUES ($1, 'USD', 'AED', 3.6725, '2026-01-01') ON CONFLICT DO NOTHING`, [tenantId]);
    await qr.query(`INSERT INTO exchange_rates (tenant_id, from_currency, to_currency, rate, effective_date) VALUES ($1, 'EUR', 'AED', 3.9800, '2026-01-01') ON CONFLICT DO NOTHING`, [tenantId]);

    await qr.query(`INSERT INTO tax_rules (tenant_id, name, type, rate, is_inclusive) VALUES ($1, 'UAE VAT', 'vat', 5.0000, false) ON CONFLICT DO NOTHING`, [tenantId]);
    await qr.query(`INSERT INTO tax_rules (tenant_id, name, type, rate, is_inclusive) VALUES ($1, 'Registration Fee', 'registration', 4.0000, false) ON CONFLICT DO NOTHING`, [tenantId]);
    await qr.query(`INSERT INTO tax_rules (tenant_id, name, type, rate, is_inclusive) VALUES ($1, 'WHT - Broker', 'withholding', 5.0000, false) ON CONFLICT DO NOTHING`, [tenantId]);
    console.log('  ✅ Currencies, Exchange Rates & Tax Rules');

    // ============================================================
    // 6. PROJECT: SUNSET GARDENS
    // ============================================================
    const [project] = await qr.query(`
      INSERT INTO projects (tenant_id, company_id, branch_id, code, name, name_ar, type, location_city, location_country, start_date, expected_end_date, completion_pct, revenue_recognition_method)
      VALUES ($1, $2, $3, 'SG', 'Sunset Gardens', 'حدائق الغروب', 'residential', 'Dubai', 'AE', '2026-01-01', '2028-06-30', 35.00, 'percentage_of_completion')
      ON CONFLICT DO NOTHING RETURNING id
    `, [tenantId, comp1Id, hqId]);
    const projId = project?.id || (await qr.query(`SELECT id FROM projects WHERE tenant_id=$1 AND code='SG'`, [tenantId]))[0].id;

    // Phase 1
    const [phase1] = await qr.query(`
      INSERT INTO phases (tenant_id, project_id, code, name, expected_delivery, sort_order)
      VALUES ($1, $2, 'SG-PH1', 'Garden Villas', '2027-12-31', 1)
      ON CONFLICT DO NOTHING RETURNING id
    `, [tenantId, projId]);
    const ph1Id = phase1?.id || (await qr.query(`SELECT id FROM phases WHERE tenant_id=$1 AND code='SG-PH1'`, [tenantId]))[0].id;

    // Phase 2
    const [phase2] = await qr.query(`
      INSERT INTO phases (tenant_id, project_id, code, name, expected_delivery, sort_order)
      VALUES ($1, $2, 'SG-PH2', 'Lake Residences', '2028-06-30', 2)
      ON CONFLICT DO NOTHING RETURNING id
    `, [tenantId, projId]);
    const ph2Id = phase2?.id || (await qr.query(`SELECT id FROM phases WHERE tenant_id=$1 AND code='SG-PH2'`, [tenantId]))[0].id;

    // Buildings
    const [bldgA] = await qr.query(`INSERT INTO buildings (tenant_id, phase_id, code, name, floors_count) VALUES ($1, $2, 'SG-PH1-A', 'Building A', 4) ON CONFLICT DO NOTHING RETURNING id`, [tenantId, ph1Id]);
    const bldgAId = bldgA?.id || (await qr.query(`SELECT id FROM buildings WHERE tenant_id=$1 AND code='SG-PH1-A'`, [tenantId]))[0].id;

    const [bldgB] = await qr.query(`INSERT INTO buildings (tenant_id, phase_id, code, name, floors_count) VALUES ($1, $2, 'SG-PH1-B', 'Building B', 3) ON CONFLICT DO NOTHING RETURNING id`, [tenantId, ph1Id]);
    const bldgBId = bldgB?.id || (await qr.query(`SELECT id FROM buildings WHERE tenant_id=$1 AND code='SG-PH1-B'`, [tenantId]))[0].id;

    const [bldgC] = await qr.query(`INSERT INTO buildings (tenant_id, phase_id, code, name, floors_count) VALUES ($1, $2, 'SG-PH2-C', 'Building C', 5) ON CONFLICT DO NOTHING RETURNING id`, [tenantId, ph2Id]);
    const bldgCId = bldgC?.id || (await qr.query(`SELECT id FROM buildings WHERE tenant_id=$1 AND code='SG-PH2-C'`, [tenantId]))[0].id;

    console.log('  ✅ Project: Sunset Gardens (2 phases, 3 buildings)');

    // ============================================================
    // 7. SAMPLE UNITS (abbreviated — 10 key units)
    // ============================================================
    const unitInsert = `INSERT INTO units (tenant_id, project_id, phase_id, building_id, code, type, bedrooms, built_up_area, price_per_sqm, total_price, status, view_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::unit_status, $12) ON CONFLICT DO NOTHING`;

    const sampleUnits = [
      [projId, ph1Id, bldgAId, 'SG-PH1-A-G01', 'apartment', 3, 180, 15000, 2700000, 'sold', 'garden'],
      [projId, ph1Id, bldgAId, 'SG-PH1-A-G02', 'apartment', 3, 180, 15000, 2700000, 'reserved', 'garden'],
      [projId, ph1Id, bldgAId, 'SG-PH1-A-G03', 'apartment', 3, 175, 15000, 2625000, 'available', 'garden'],
      [projId, ph1Id, bldgAId, 'SG-PH1-A-101', 'apartment', 2, 120, 14500, 1740000, 'sold', 'pool'],
      [projId, ph1Id, bldgAId, 'SG-PH1-A-102', 'apartment', 2, 120, 14500, 1740000, 'sold', 'pool'],
      [projId, ph1Id, bldgAId, 'SG-PH1-A-301', 'apartment', 3, 200, 16000, 3200000, 'sold', 'panoramic'],
      [projId, ph1Id, bldgBId, 'SG-PH1-B-G01', 'duplex', 4, 280, 17000, 4760000, 'sold', 'garden'],
      [projId, ph1Id, bldgBId, 'SG-PH1-B-101', 'apartment', 1, 75, 13000, 975000, 'sold', 'city'],
      [projId, ph2Id, bldgCId, 'SG-PH2-C-G01', 'studio', 0, 45, 13000, 585000, 'available', 'garden'],
      [projId, ph2Id, bldgCId, 'SG-PH2-C-201', 'apartment', 2, 110, 15000, 1650000, 'available', 'lake'],
    ];
    for (const u of sampleUnits) {
      await qr.query(unitInsert, [tenantId, ...u]);
    }
    console.log('  ✅ Units (10 sample)');

    // ============================================================
    // 8. CUSTOMERS (5 key)
    // ============================================================
    const custInsert = `INSERT INTO customers (tenant_id, first_name, last_name, phone, nationality, id_type, id_number, kyc_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING RETURNING id`;
    const custs: string[] = [];
    const custData = [
      ['Khalid', 'Al-Mansour', '+971501001001', 'AE', 'national_id', 'AE-784-1990-1234567', 'verified'],
      ['Elena', 'Petrova', '+971501001002', 'RU', 'passport', 'RU-12345678', 'verified'],
      ['Rajesh', 'Gupta', '+971501001003', 'IN', 'passport', 'IN-J8765432', 'verified'],
      ['Aisha', 'Mohammed', '+971501001004', 'AE', 'national_id', 'AE-784-1985-7654321', 'verified'],
      ['John', 'Smith', '+971501001005', 'GB', 'passport', 'GB-987654321', 'verified'],
    ];
    for (const c of custData) {
      const [row] = await qr.query(custInsert, [tenantId, ...c]);
      if (row) custs.push(row.id);
    }
    if (custs.length === 0) {
      const rows = await qr.query(`SELECT id FROM customers WHERE tenant_id=$1 ORDER BY created_at LIMIT 5`, [tenantId]);
      rows.forEach((r: { id: string }) => custs.push(r.id));
    }
    console.log(`  ✅ Customers (${custs.length})`);

    // ============================================================
    // 9. CHART OF ACCOUNTS (top-level)
    // ============================================================
    const coaInsert = `INSERT INTO chart_of_accounts (tenant_id, code, name, name_ar, type, is_header)
      VALUES ($1, $2, $3, $4, $5::account_type, $6) ON CONFLICT DO NOTHING`;
    const coa = [
      ['1000', 'Assets', 'الأصول', 'asset', true],
      ['1100', 'Current Assets', 'الأصول المتداولة', 'asset', true],
      ['1101', 'Cash on Hand', 'النقد في الصندوق', 'asset', false],
      ['1110', 'Bank - Main Account', 'البنك - الحساب الرئيسي', 'asset', false],
      ['1120', 'Cheques Under Collection', 'شيكات تحت التحصيل', 'asset', false],
      ['1130', 'Accounts Receivable - Sales', 'ذمم مدينة - مبيعات', 'asset', false],
      ['1160', 'Inventory', 'المخزون', 'asset', false],
      ['2000', 'Liabilities', 'الالتزامات', 'liability', true],
      ['2100', 'Current Liabilities', 'الالتزامات المتداولة', 'liability', true],
      ['2110', 'Accounts Payable', 'ذمم دائنة', 'liability', false],
      ['2160', 'Customer Deposits', 'ودائع العملاء', 'liability', false],
      ['2170', 'Deferred Revenue', 'الإيرادات المؤجلة', 'liability', false],
      ['3000', 'Equity', 'حقوق الملكية', 'equity', true],
      ['3100', 'Share Capital', 'رأس المال', 'equity', false],
      ['3200', 'Retained Earnings', 'الأرباح المحتجزة', 'equity', false],
      ['4000', 'Revenue', 'الإيرادات', 'revenue', true],
      ['4100', 'Unit Sales Revenue', 'إيرادات بيع الوحدات', 'revenue', false],
      ['4200', 'Penalty Income', 'إيرادات غرامات', 'revenue', false],
      ['5000', 'Cost of Sales', 'تكلفة المبيعات', 'expense', true],
      ['5100', 'Cost of Units Sold', 'تكلفة الوحدات المباعة', 'expense', false],
      ['6000', 'Operating Expenses', 'المصروفات التشغيلية', 'expense', true],
      ['6110', 'Salaries & Wages', 'الرواتب والأجور', 'expense', false],
      ['6220', 'Broker Commissions', 'عمولات الوسطاء', 'expense', false],
      ['6360', 'Depreciation', 'الإهلاك', 'expense', false],
    ];
    for (const a of coa) {
      await qr.query(coaInsert, [tenantId, ...a]);
    }
    console.log('  ✅ Chart of Accounts (24 accounts)');

    console.log('\n🎉 Seeding complete!');
  } catch (err) {
    console.error('❌ Seed error:', err);
    throw err;
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
