import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { InitialSchema1707600000000 } from './migrations/1707600000000-InitialSchema';
import { AddNotificationsTable1707600100000 } from './migrations/1707600100000-AddNotificationsTable';

dotenv.config({ path: '.env.local' });
dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 're_erp',
  username: process.env.DB_USER || 'erp_user',
  password: process.env.DB_PASSWORD || 'erp_pass',
  ssl: process.env.DB_SSL === 'true',
  synchronize: false,
  logging: ['query', 'error'],
  migrations: [InitialSchema1707600000000, AddNotificationsTable1707600100000],
});

async function runMigrations() {
  console.log('🔄 Connecting to database...');
  await dataSource.initialize();
  console.log('🔄 Running migrations...');
  const migrations = await dataSource.runMigrations();
  if (migrations.length === 0) {
    console.log('✅ No pending migrations.');
  } else {
    console.log(`✅ Ran ${migrations.length} migration(s):`);
    migrations.forEach((m) => console.log(`   - ${m.name}`));
  }
  await dataSource.destroy();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
