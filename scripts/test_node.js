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
  console.log('LOGIN:', login.status);
  const token = JSON.parse(login.body).data.accessToken;
  console.log('TOKEN:', token.substring(0, 30) + '...');

  // GET employees
  const list = await req('GET', '/api/v1/hr/employees', null, token);
  console.log('GET /hr/employees:', list.status, list.body.substring(0, 200));

  // POST employee
  const create = await req('POST', '/api/v1/hr/employees', {
    firstName: 'Test', lastName: 'Employee', email: 'test@groz.ae',
    phone: '+971500000000', hireDate: '2026-01-15', jobTitle: 'Tester', basicSalary: 5000
  }, token);
  console.log('POST /hr/employees:', create.status, create.body.substring(0, 500));
})();
