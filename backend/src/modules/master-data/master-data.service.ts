import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MasterDataService {
  constructor(private readonly dataSource: DataSource) {}

  async getCurrencies(tenantId: string) {
    return this.dataSource.query(`SELECT * FROM currencies WHERE tenant_id = $1 ORDER BY is_default DESC, code`, [tenantId]);
  }

  async getExchangeRates(tenantId: string) {
    return this.dataSource.query(
      `SELECT DISTINCT ON (from_currency, to_currency) * FROM exchange_rates WHERE tenant_id = $1 ORDER BY from_currency, to_currency, effective_date DESC`,
      [tenantId],
    );
  }

  async getTaxRules(tenantId: string) {
    return this.dataSource.query(`SELECT * FROM tax_rules WHERE tenant_id = $1 AND is_active = true ORDER BY name`, [tenantId]);
  }

  async getSettings(tenantId: string, companyId?: string) {
    const qb = `SELECT * FROM settings WHERE tenant_id = $1` + (companyId ? ` AND (company_id = $2 OR company_id IS NULL)` : ``) + ` ORDER BY key`;
    return this.dataSource.query(qb, companyId ? [tenantId, companyId] : [tenantId]);
  }

  async upsertSetting(tenantId: string, key: string, value: any, companyId?: string) {
    await this.dataSource.query(
      `INSERT INTO settings (tenant_id, company_id, key, value)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, COALESCE(company_id, '00000000-0000-0000-0000-000000000000'), COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'), key)
       DO UPDATE SET value = $4, updated_at = NOW()`,
      [tenantId, companyId || null, key, JSON.stringify(value)],
    );
  }
}
