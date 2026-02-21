const bcrypt = require('/app/node_modules/bcrypt');
const { Client } = require('/app/node_modules/pg');

(async () => {
  const client = new Client({
    host: 'postgres', port: 5432,
    user: 'erp_user', password: '2QccDvkZ47Ms905StNOvPF6dfYtUwtWTQ4Ftt88', database: 're_erp',
  });
  await client.connect();

  // Check current state
  const check = await client.query(
    "SELECT id, email, is_active, failed_login_count, locked_until, password_hash FROM users WHERE email = 'demo@grozai.net'"
  );
  const user = check.rows[0];
  console.log('Current state:');
  console.log('  is_active:', user.is_active);
  console.log('  failed_login_count:', user.failed_login_count);
  console.log('  locked_until:', user.locked_until);
  console.log('  hash starts with:', user.password_hash?.substring(0, 10));

  // Test bcrypt compare with current hash
  const compareResult = await bcrypt.compare('Demo@2026!', user.password_hash);
  console.log('  bcrypt.compare result:', compareResult);

  // Generate fresh hash and update + unlock account
  const newHash = await bcrypt.hash('Demo@2026!', 12);
  console.log('\nNew hash generated, updating...');

  await client.query(
    "UPDATE users SET password_hash = $1, failed_login_count = 0, locked_until = NULL WHERE email = 'demo@grozai.net'",
    [newHash]
  );
  console.log('Password reset + account unlocked');

  // Verify new hash works
  const verify = await bcrypt.compare('Demo@2026!', newHash);
  console.log('Verify new hash:', verify);

  // Test login via API
  const http = require('http');
  const login = await new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: 'demo@grozai.net', password: 'Demo@2026!' });
    const r = http.request({ hostname: 'localhost', port: 3000, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    r.on('error', reject); r.write(data); r.end();
  });
  console.log('\nLogin test:', login.status);
  if (login.status === 200) {
    const parsed = JSON.parse(login.body);
    console.log('SUCCESS! User:', parsed.data.user.email);
    
    // Now test employee creation
    const token = parsed.data.accessToken;
    const empRes = await new Promise((resolve, reject) => {
      const data = JSON.stringify({
        firstName: 'Test', lastName: 'DemoEmp', email: 'test.demoemp@demo.com',
        department: 'Sales', jobTitle: 'Sales Rep', hireDate: '2026-02-21', basicSalary: 5000
      });
      const r = http.request({ hostname: 'localhost', port: 3000, path: '/api/v1/hr/employees', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'Authorization': 'Bearer ' + token }
      }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
      r.on('error', reject); r.write(data); r.end();
    });
    console.log('Create employee:', empRes.status, empRes.body.substring(0, 500));
  } else {
    console.log('Login body:', login.body.substring(0, 300));
  }

  await client.end();
})();
