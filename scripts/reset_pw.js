// Generate bcrypt hash for Demo@2026! and update demo user's password
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

(async () => {
  const hash = await bcrypt.hash('Demo@2026!', 12);
  console.log('Hash:', hash);

  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'erp_user',
    password: process.env.DB_PASSWORD || 'erp_password',
    database: 're_erp',
  });
  await client.connect();
  const res = await client.query(
    `UPDATE users SET password_hash = $1 WHERE email = 'demo@grozai.net' RETURNING id, email`,
    [hash]
  );
  console.log('Updated:', res.rows);
  await client.end();
})();
