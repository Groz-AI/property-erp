import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChartOfAccountEntity } from './entities/chart-of-account.entity';
import { JournalEntryEntity } from './entities/journal-entry.entity';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { AccountType, JournalStatus } from '../../shared/enums';

@ApiTags('Accounting')
@ApiBearerAuth()
@Controller({ path: 'accounting', version: '1' })
export class AccountingController {
  constructor(
    @InjectRepository(ChartOfAccountEntity)
    private readonly coaRepo: Repository<ChartOfAccountEntity>,
    @InjectRepository(JournalEntryEntity)
    private readonly jeRepo: Repository<JournalEntryEntity>,
  ) {}

  // ── Chart of Accounts ──────────────────────────────────────

  @Get('coa')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'List chart of accounts' })
  @ApiQuery({ name: 'type', required: false, enum: AccountType })
  async listCoa(@CurrentTenant() tenantId: string, @Query('type') type?: AccountType) {
    const qb = this.coaRepo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId });
    if (type) qb.andWhere('a.type = :type', { type });
    const data = await qb.orderBy('a.code', 'ASC').getMany();
    return { data };
  }

  @Get('coa/:id')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get account by ID' })
  async getCoa(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.coaRepo.findOne({ where: { id, tenantId }, relations: ['parent'] });
    return { data };
  }

  @Post('coa')
  @RequirePermissions('accounting:create')
  @ApiOperation({ summary: 'Create a chart of accounts entry' })
  async createCoa(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    const entity = this.coaRepo.create({ ...body, tenantId, createdBy: userId, updatedBy: userId });
    return { data: await this.coaRepo.save(entity) };
  }

  // ── Journal Entries ────────────────────────────────────────

  @Get('journals')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'List journal entries' })
  @ApiQuery({ name: 'status', required: false, enum: JournalStatus })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  async listJournals(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: JournalStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const qb = this.jeRepo.createQueryBuilder('je')
      .where('je.tenantId = :tenantId', { tenantId });
    if (status) qb.andWhere('je.status = :status', { status });
    if (fromDate) qb.andWhere('je.entryDate >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('je.entryDate <= :toDate', { toDate });
    const data = await qb.orderBy('je.entryDate', 'DESC').addOrderBy('je.entryNumber', 'DESC').getMany();
    return { data };
  }

  @Get('journals/:id')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get journal entry with lines' })
  async getJournal(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    const entry = await this.jeRepo.findOne({ where: { id, tenantId } });
    if (!entry) return { data: null };
    const lines = await this.jeRepo.manager.query(
      `SELECT jl.*, coa.code as account_code, coa.name as account_name
       FROM journal_lines jl
       JOIN chart_of_accounts coa ON coa.id = jl.account_id
       WHERE jl.journal_entry_id = $1
       ORDER BY jl.debit DESC, jl.created_at`,
      [id],
    );
    return { data: { ...entry, lines } };
  }

  // ── Trial Balance ──────────────────────────────────────────

  @Get('trial-balance')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Generate trial balance' })
  @ApiQuery({ name: 'asOfDate', required: false })
  async trialBalance(@CurrentTenant() tenantId: string, @Query('asOfDate') asOfDate?: string) {
    const date = asOfDate || new Date().toISOString().split('T')[0];
    const data = await this.jeRepo.manager.query(
      `SELECT coa.code, coa.name, coa.type, coa.normal_balance,
              COALESCE(SUM(jl.debit), 0) as total_debit,
              COALESCE(SUM(jl.credit), 0) as total_credit,
              COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0) as balance
       FROM chart_of_accounts coa
       LEFT JOIN journal_lines jl ON jl.account_id = coa.id
       LEFT JOIN journal_entries je ON je.id = jl.journal_entry_id AND je.status = 'posted' AND je.entry_date <= $2
       WHERE coa.tenant_id = $1 AND coa.is_header = false AND coa.is_active = true
       GROUP BY coa.id, coa.code, coa.name, coa.type, coa.normal_balance
       HAVING COALESCE(SUM(jl.debit), 0) != 0 OR COALESCE(SUM(jl.credit), 0) != 0
       ORDER BY coa.code`,
      [tenantId, date],
    );
    return { data, meta: { asOfDate: date } };
  }
}
