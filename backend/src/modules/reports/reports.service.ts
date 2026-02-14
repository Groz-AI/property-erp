import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async getSalesReport(tenantId: string, filters?: { from?: string; to?: string; projectId?: string }): Promise<any> {
    const qb = this.dataSource.createQueryBuilder()
      .select('p.name', 'project')
      .addSelect('COUNT(b.id)', 'bookings')
      .addSelect('SUM(b.net_price)', 'totalValue')
      .from('bookings', 'b')
      .leftJoin('projects', 'p', 'p.id = b.project_id')
      .where('b.tenant_id = :tenantId', { tenantId });
    if (filters?.from) qb.andWhere('b.created_at >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('b.created_at <= :to', { to: filters.to });
    if (filters?.projectId) qb.andWhere('b.project_id = :projectId', { projectId: filters.projectId });
    return qb.groupBy('p.name').getRawMany();
  }

  async getCollectionsReport(tenantId: string, filters?: { from?: string; to?: string }): Promise<any> {
    const qb = this.dataSource.createQueryBuilder()
      .select('DATE_TRUNC(\'month\', r.receipt_date)', 'month')
      .addSelect('SUM(r.amount)', 'collected')
      .addSelect('COUNT(r.id)', 'receipts')
      .from('receipts', 'r')
      .where('r.tenant_id = :tenantId', { tenantId })
      .andWhere('r.status = :status', { status: 'confirmed' });
    if (filters?.from) qb.andWhere('r.receipt_date >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('r.receipt_date <= :to', { to: filters.to });
    return qb.groupBy('month').orderBy('month', 'ASC').getRawMany();
  }

  async getAgingReport(tenantId: string): Promise<any> {
    return this.dataSource.query(
      `SELECT c.first_name || ' ' || c.last_name AS customer,
              con.contract_number,
              SUM(CASE WHEN i.status = 'overdue' THEN i.amount - i.paid_amount ELSE 0 END) AS overdue,
              SUM(CASE WHEN i.status = 'due' THEN i.amount - i.paid_amount ELSE 0 END) AS due,
              SUM(CASE WHEN i.status = 'upcoming' THEN i.amount - i.paid_amount ELSE 0 END) AS upcoming
       FROM installments i
       JOIN contracts con ON con.id = i.contract_id
       JOIN customers c ON c.id = con.customer_id
       WHERE i.tenant_id = $1
       GROUP BY customer, con.contract_number
       ORDER BY overdue DESC`,
      [tenantId],
    );
  }
}
