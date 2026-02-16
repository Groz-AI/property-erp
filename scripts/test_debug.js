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
  // Login
  const login = await req('POST', '/api/v1/auth/login', { email: 'ahmad@groz.ae', password: 'Demo@2026!' });
  const token = JSON.parse(login.body).data.accessToken;
  
  // Decode JWT payload
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  console.log('JWT payload:', JSON.stringify(payload, null, 2));
  
  // Check what the HR controller receives - test the health endpoint first
  const health = await req('GET', '/api/v1/health', null, token);
  console.log('Health:', health.status, health.body.substring(0, 200));
  
  // Test GET employees (this works)
  const list = await req('GET', '/api/v1/hr/employees', null, token);
  console.log('GET employees:', list.status, list.body);

  // Test POST employees with explicit companyId
  const create1 = await req('POST', '/api/v1/hr/employees', {
    firstName: 'Test', lastName: 'Employee', email: 'test@groz.ae',
    phone: '+971500000000', hireDate: '2026-01-15', jobTitle: 'Tester', basicSalary: 5000
  }, token);
  console.log('POST employees (no companyId):', create1.status, create1.body);

  // Also try with explicit companyId
  const create2 = await req('POST', '/api/v1/hr/employees', {
    firstName: 'Test2', lastName: 'Employee2', email: 'test2@groz.ae',
    phone: '+971500000001', hireDate: '2026-01-15', jobTitle: 'Tester',
    basicSalary: 5000, companyId: 'ee3a6d7c-2da2-496c-8e57-0bff3926288e'
  }, token);
  console.log('POST employees (with companyId):', create2.status, create2.body.substring(0, 500));
})();
