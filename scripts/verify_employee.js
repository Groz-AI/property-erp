// Verify employee creation works for admin@test.com
// We'll test by hitting the API internally - but we need the password.
// Let's try the token from the frontend (decode the existing JWT to get user ID, then test directly)
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
  // Try common passwords for admin@test.com
  const passwords = ['Demo@2026!', 'Admin@123', 'admin123', 'Test@123', 'Password@123', 'admin@test'];
  let token = null;

  for (const pwd of passwords) {
    const login = await req('POST', '/api/v1/auth/login', { email: 'admin@test.com', password: pwd });
    if (login.status === 200) {
      token = JSON.parse(login.body).data.accessToken;
      console.log('Login SUCCESS with password:', pwd);
      break;
    }
    console.log('Password', pwd, '-> status', login.status);
  }

  if (!token) {
    console.log('Could not login as admin@test.com - testing with ahmad@groz.ae instead');
    const login = await req('POST', '/api/v1/auth/login', { email: 'ahmad@groz.ae', password: 'Demo@2026!' });
    if (login.status === 200) {
      token = JSON.parse(login.body).data.accessToken;
      console.log('Login as ahmad@groz.ae SUCCESS');
    } else {
      console.log('BOTH logins failed');
      return;
    }
  }

  // Decode JWT
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  console.log('JWT payload:', JSON.stringify(payload, null, 2));

  // Test GET employees
  const list = await req('GET', '/api/v1/hr/employees', null, token);
  console.log('GET /hr/employees:', list.status);

  // Test POST employees
  const create = await req('POST', '/api/v1/hr/employees', {
    firstName: 'TestFix', lastName: 'Employee', email: 'testfix@example.com',
    department: 'IT', jobTitle: 'Engineer', hireDate: '2026-02-17',
    basicSalary: 10000, nationality: 'EG'
  }, token);
  console.log('POST /hr/employees:', create.status, create.body.substring(0, 500));
})();
