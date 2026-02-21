const bcrypt = require('/app/node_modules/bcrypt');
const { Client } = require('/app/node_modules/pg');

(async () => {
  const hash = await bcrypt.hash('Demo@2026!', 12);
  console.log('Generated hash for Demo@2026!');

  const client = new Client({
    host: 'postgres', port: 5432,
    user: 'erp_user', password: '2QccDvkZ47Ms905StNOvPF6dfYtUwtWTQ4Ftt88', database: 're_erp',
  });
  await client.connect();
  const res = await client.query(
    "UPDATE users SET password_hash = $1 WHERE email = 'demo@grozai.net' RETURNING id, email",
    [hash]
  );
  console.log('Updated:', res.rows);

  // Test login
  const http = require('http');
  const login = await new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: 'demo@grozai.net', password: 'Demo@2026!' });
    const r = http.request({ hostname: 'localhost', port: 3000, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    r.on('error', reject); r.write(data); r.end();
  });
  console.log('Login test:', login.status);

  if (login.status === 200) {
    const token = JSON.parse(login.body).data.accessToken;
    const empRes = await new Promise((resolve, reject) => {
      const data = JSON.stringify({
        firstName: 'Test', lastName: 'Employee', email: 'test.emp@demo.com',
        department: 'Sales', jobTitle: 'Sales Rep', hireDate: '2026-02-21', basicSalary: 5000
      });
      const r = http.request({ hostname: 'localhost', port: 3000, path: '/api/v1/hr/employees', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'Authorization': 'Bearer ' + token }
      }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
      r.on('error', reject); r.write(data); r.end();
    });
    console.log('Create employee:', empRes.status, empRes.body.substring(0, 500));
  }
  await client.end();
})();
