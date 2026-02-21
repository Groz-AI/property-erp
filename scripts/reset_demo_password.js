const http = require('http');
const crypto = require('crypto');

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

(async () => {
  // Try logging in as demo@grozai.net with various passwords
  const passwords = ['Demo@2026!', 'demo@2026!', 'Password123!', 'Admin@123', 'Groz@2026!'];
  for (const pw of passwords) {
    const r = await req('POST', '/api/v1/auth/login', { email: 'demo@grozai.net', password: pw });
    console.log(`Login demo@grozai.net with "${pw}": ${r.status}`);
    if (r.status === 200) {
      console.log('SUCCESS! Token received.');
      const token = JSON.parse(r.body).data.accessToken;
      
      // Try to create employee
      const emp = await req('POST', '/api/v1/hr/employees', {
        firstName: 'Test', lastName: 'Employee',
        email: 'test.emp@grozai.net', department: 'Sales',
        jobTitle: 'Sales Rep', hireDate: '2026-02-21', basicSalary: 5000
      }, token);
      console.log('Create employee:', emp.status, emp.body.substring(0, 300));
      return;
    }
  }
  console.log('All passwords failed. Need to reset password in DB.');
})();
