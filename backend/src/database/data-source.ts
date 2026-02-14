import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 're_erp',
  username: process.env.DB_USER || 'erp_user',
  password: process.env.DB_PASSWORD || 'erp_pass',
  ssl: process.env.DB_SSL === 'true',
  synchronize: false,
  logging: ['error'],
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
