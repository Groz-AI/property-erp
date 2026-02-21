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
(async () => {
  // Login as demo@grozai.net
  const login = await req('POST', '/api/v1/auth/login', { email: 'demo@grozai.net', password: 'Demo@2026!' });
  if (login.status !== 200) {
    console.log('LOGIN FAILED:', login.status, login.body);
    return;
  }
  const token = JSON.parse(login.body).data.accessToken;
  console.log('Logged in as demo@grozai.net');

  // Simulate exactly what frontend sends
  const payload = {
    firstName: 'Test',
    lastName: 'Employee',
    email: 'test.emp@grozai.net',
    department: 'Sales',
    jobTitle: 'Sales Rep',
    hireDate: '2026-02-21',
    basicSalary: 5000,
    nationality: 'AE'
  };
  console.log('Creating employee with:', JSON.stringify(payload, null, 2));
  const res = await req('POST', '/api/v1/hr/employees', payload, token);
  console.log('Response:', res.status, res.body);
})();
