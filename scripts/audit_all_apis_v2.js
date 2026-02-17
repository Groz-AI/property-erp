// Comprehensive API audit v2 - tests every GET list endpoint and POST create endpoint
// with correct field names matching entity definitions
const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const r = http.request({ hostname: 'localhost', port: 3000, path, method, headers }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

const R = [];

async function test(label, method, path, body, token) {
  try {
    const r = await req(method, '/api/v1' + path, body, token);
    const ok = r.status >= 200 && r.status < 300;
    let errMsg = '';
    if (!ok) {
      try { errMsg = JSON.parse(r.body).message || r.body.substring(0, 200); } catch { errMsg = r.body.substring(0, 200); }
    }
    R.push({ label, method, path, status: r.status, ok, errMsg });
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} [${r.status}] ${method} ${path} — ${label}${errMsg ? ' :: ' + errMsg : ''}`);
    return r;
  } catch (e) {
    R.push({ label, method, path, status: 0, ok: false, errMsg: e.message });
    console.log(`💥 [ERR] ${method} ${path} — ${label} :: ${e.message}`);
    return { status: 0, body: '' };
  }
}

(async () => {
  // ── Login ──
  const login = await req('POST', '/api/v1/auth/login', { email: 'ahmad@groz.ae', password: 'Demo@2026!' });
  if (login.status !== 200) { console.log('LOGIN FAILED:', login.body); return; }
  const token = JSON.parse(login.body).data.accessToken;
  console.log('🔑 Logged in as ahmad@groz.ae\n');

  // ══════════════════════════════════════════
  // GET LIST ENDPOINTS
  // ══════════════════════════════════════════
  console.log('═══ GET LIST ENDPOINTS ═══');
  await test('List customers', 'GET', '/customers', null, token);
  await test('List leads', 'GET', '/leads', null, token);
  await test('List bookings', 'GET', '/bookings', null, token);
  await test('List contracts', 'GET', '/contracts', null, token);
  await test('List projects', 'GET', '/projects', null, token);
  await test('List units', 'GET', '/units', null, token);
  await test('List employees', 'GET', '/hr/employees', null, token);
  await test('List payslips', 'GET', '/payroll/payslips', null, token);
  await test('List brokers', 'GET', '/brokers', null, token);
  await test('List contractors', 'GET', '/contractors', null, token);
  await test('List claims', 'GET', '/contractors/claims', null, token);
  await test('List receipts', 'GET', '/receipts', null, token);
  await test('List COA', 'GET', '/accounting/coa', null, token);
  await test('List journals', 'GET', '/accounting/journals', null, token);
  await test('Trial balance', 'GET', '/accounting/trial-balance', null, token);
  await test('List handover', 'GET', '/handover', null, token);
  await test('List maintenance tickets', 'GET', '/maintenance/tickets', null, token);
  await test('List vendors', 'GET', '/procurement/vendors', null, token);
  await test('List purchase orders', 'GET', '/procurement/purchase-orders', null, token);
  await test('List inventory items', 'GET', '/inventory/items', null, token);
  await test('List notifications', 'GET', '/notifications', null, token);
  await test('List users', 'GET', '/users', null, token);
  await test('List roles', 'GET', '/roles', null, token);
  await test('List companies', 'GET', '/companies', null, token);
  await test('List branches', 'GET', '/branches', null, token);
  await test('List bank accounts', 'GET', '/cash-bank/accounts', null, token);
  await test('List refunds', 'GET', '/refunds', null, token);
  await test('List fixed assets', 'GET', '/fixed-assets', null, token);
  await test('List AP invoices', 'GET', '/accounts-payable/invoices', null, token);
  await test('List approvals', 'GET', '/approvals', null, token);
  await test('Sales report', 'GET', '/reports/sales', null, token);
  await test('Collections report', 'GET', '/reports/collections', null, token);
  await test('Aging report', 'GET', '/reports/aging', null, token);

  // ══════════════════════════════════════════
  // POST CREATE ENDPOINTS
  // ══════════════════════════════════════════
  console.log('\n═══ POST CREATE ENDPOINTS ═══');
  const ts = Date.now();

  // Customer — entity: firstName, lastName, phone, nationality, idType, idNumber, kycStatus
  await test('Create customer', 'POST', '/customers', {
    firstName: 'AuditTest', lastName: 'Cust' + ts,
    phone: '+971500000099', nationality: 'AE',
    idType: 'national_id', idNumber: 'AE-TEST-' + ts, kycStatus: 'pending'
  }, token);

  // Lead — entity: firstName, lastName, email, phone, source, status
  await test('Create lead', 'POST', '/leads', {
    firstName: 'AuditTest', lastName: 'Lead' + ts,
    email: `auditlead${ts}@test.com`, phone: '+971500000098',
    source: 'website', status: 'new'
  }, token);

  // Employee — HR service auto-generates employeeNumber + companyId
  await test('Create employee', 'POST', '/hr/employees', {
    firstName: 'AuditTest', lastName: 'Emp' + ts,
    email: `auditemp${ts}@test.com`, phone: '+971500000097',
    hireDate: '2026-02-17', jobTitle: 'Auditor', basicSalary: 8000
  }, token);

  // Broker — entity: name, phone (NOT NULL), licenseNumber, email, contactPerson
  await test('Create broker', 'POST', '/brokers', {
    name: 'AuditTest Broker ' + ts, phone: '+971500000096',
    licenseNumber: 'LIC-' + ts, email: `auditbroker${ts}@test.com`,
    contactPerson: 'Test Contact', commissionRate: 2.5
  }, token);

  // Contractor — entity: name, phone (NOT NULL), specialization
  await test('Create contractor', 'POST', '/contractors', {
    name: 'AuditTest Contractor ' + ts, phone: '+971500000095',
    specialization: 'General', contactPerson: 'Test Contact'
  }, token);

  // Vendor — entity: name, phone (NOT NULL), email, contactPerson
  await test('Create vendor', 'POST', '/procurement/vendors', {
    name: 'AuditTest Vendor ' + ts, phone: '+971500000094',
    email: `auditvendor${ts}@test.com`, contactPerson: 'Test Contact'
  }, token);

  // Inventory item — entity: code (NOT NULL), name, category, uom
  await test('Create inventory item', 'POST', '/inventory/items', {
    code: 'ITM-' + ts, name: 'AuditTest Item ' + ts,
    category: 'Office Supplies', uom: 'piece'
  }, token);

  // COA — entity: code, name, type (enum), isHeader
  await test('Create COA entry', 'POST', '/accounting/coa', {
    code: '9' + String(ts).slice(-3), name: 'AuditTest Account ' + ts,
    type: 'expense', isHeader: false
  }, token);

  // Bank account — entity: companyId (auto-resolved), accountName, bankName, accountNumber, currency
  await test('Create bank account', 'POST', '/cash-bank/accounts', {
    accountName: 'AuditTest Bank ' + ts, bankName: 'Test Bank',
    accountNumber: 'ACC-' + ts, currency: 'AED'
  }, token);

  // Fixed asset — entity: assetCode (auto), companyId (auto), name, purchaseDate, purchaseCost, usefulLifeMonths
  await test('Create fixed asset', 'POST', '/fixed-assets', {
    name: 'AuditTest Asset ' + ts, category: 'Equipment',
    purchaseDate: '2026-01-01', purchaseCost: 50000,
    usefulLifeMonths: 60, status: 'active'
  }, token);

  // NOTE: These require existing FKs — testing with minimal data
  // Maintenance ticket needs unitId, customerId — skip if no data
  // Handover needs contractId, unitId, customerId — skip if no data
  // AP Invoice needs vendorId — skip if no vendors
  // Refund needs contractId, customerId — skip if no data
  // Approval needs entityId, requestedBy, assignedTo — skip

  console.log('\n(Skipping POST tests for modules requiring existing FK records: maintenance, handover, AP invoices, refunds, approvals)');

  // ══════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════
  console.log('\n═══ SUMMARY ═══');
  const passed = R.filter(r => r.ok).length;
  const failed = R.filter(r => !r.ok).length;
  console.log(`Total: ${R.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  if (failed > 0) {
    console.log('\nFailed endpoints:');
    R.filter(r => !r.ok).forEach(r => {
      console.log(`  ❌ [${r.status}] ${r.method} ${r.path} — ${r.label} :: ${r.errMsg}`);
    });
  }
})();
