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
  // Login as admin@test.com
  const login = await req('POST', '/api/v1/auth/login', { email: 'admin@test.com', password: 'Demo@2026!' });
  console.log('LOGIN status:', login.status);
  
  if (login.status !== 200) {
    console.log('LOGIN body:', login.body);
    return;
  }
  
  const token = JSON.parse(login.body).data.accessToken;
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  console.log('JWT payload:', JSON.stringify(payload, null, 2));

  // Test GET employees
  const list = await req('GET', '/api/v1/hr/employees', null, token);
  console.log('GET /hr/employees:', list.status, list.body.substring(0, 300));

  // Test POST employees
  const create = await req('POST', '/api/v1/hr/employees', {
    firstName: 'ahmed', lastName: 'ali', email: 'ahmed.ali@test.com',
    department: 'Sales', jobTitle: 'Cashier', hireDate: '2026-02-16',
    basicSalary: 15000, nationality: 'EG'
  }, token);
  console.log('POST /hr/employees:', create.status, create.body.substring(0, 500));
})();
