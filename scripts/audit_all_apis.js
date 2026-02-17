// Comprehensive API audit - tests every GET list endpoint and POST create endpoint
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

const R = []; // results

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
  // GET LIST ENDPOINTS (read operations)
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
  await test('List reports', 'GET', '/reports/dashboard', null, token);

  // ══════════════════════════════════════════
  // POST CREATE ENDPOINTS (write operations)
  // ══════════════════════════════════════════
  console.log('\n═══ POST CREATE ENDPOINTS ═══');
  const ts = Date.now();

  await test('Create customer', 'POST', '/customers', {
    firstName: 'AuditTest', lastName: 'Customer' + ts,
    phone: '+971500000099', nationality: 'AE',
    idType: 'national_id', idNumber: 'AE-TEST-' + ts, kycStatus: 'pending'
  }, token);

  await test('Create lead', 'POST', '/leads', {
    firstName: 'AuditTest', lastName: 'Lead' + ts,
    email: `auditlead${ts}@test.com`, phone: '+971500000098',
    source: 'website', status: 'new'
  }, token);

  await test('Create employee', 'POST', '/hr/employees', {
    firstName: 'AuditTest', lastName: 'Emp' + ts,
    email: `auditemp${ts}@test.com`, phone: '+971500000097',
    hireDate: '2026-02-17', jobTitle: 'Auditor', basicSalary: 8000
  }, token);

  await test('Create broker', 'POST', '/brokers', {
    name: 'AuditTest Broker ' + ts, licenseNumber: 'LIC-' + ts,
    contactName: 'Test Contact', contactPhone: '+971500000096',
    commissionRate: 2.5
  }, token);

  await test('Create contractor', 'POST', '/contractors', {
    name: 'AuditTest Contractor ' + ts, tradeCategory: 'General',
    contactName: 'Test Contact', contactPhone: '+971500000095'
  }, token);

  await test('Create vendor', 'POST', '/procurement/vendors', {
    name: 'AuditTest Vendor ' + ts, contactName: 'Test Contact',
    contactEmail: `auditvendor${ts}@test.com`, contactPhone: '+971500000094'
  }, token);

  await test('Create inventory item', 'POST', '/inventory/items', {
    name: 'AuditTest Item ' + ts, sku: 'SKU-' + ts,
    category: 'Office Supplies', unit: 'piece', currentStock: 100
  }, token);

  await test('Create COA entry', 'POST', '/accounting/coa', {
    code: '9' + String(ts).slice(-3), name: 'AuditTest Account ' + ts,
    type: 'expense', isHeader: false
  }, token);

  await test('Create maintenance ticket', 'POST', '/maintenance/tickets', {
    title: 'AuditTest Ticket ' + ts, description: 'Test ticket',
    priority: 'medium', status: 'open'
  }, token);

  await test('Create handover', 'POST', '/handover', {
    status: 'scheduled', scheduledDate: '2026-03-01',
    notes: 'AuditTest handover ' + ts
  }, token);

  await test('Create bank account', 'POST', '/cash-bank/accounts', {
    accountName: 'AuditTest Bank ' + ts, bankName: 'Test Bank',
    accountNumber: 'ACC-' + ts, currency: 'AED'
  }, token);

  await test('Create fixed asset', 'POST', '/fixed-assets', {
    name: 'AuditTest Asset ' + ts, category: 'Equipment',
    acquisitionDate: '2026-01-01', acquisitionCost: 50000, status: 'active'
  }, token);

  await test('Create AP invoice', 'POST', '/accounts-payable/invoices', {
    invoiceNumber: 'APINV-' + ts, amount: 10000, currency: 'AED',
    dueDate: '2026-03-15', status: 'draft'
  }, token);

  await test('Create approval', 'POST', '/approvals', {
    entityType: 'purchase_order', description: 'AuditTest approval ' + ts,
    status: 'pending'
  }, token);

  await test('Create refund', 'POST', '/refunds', {
    amount: 5000, reason: 'AuditTest refund ' + ts, status: 'pending'
  }, token);

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
