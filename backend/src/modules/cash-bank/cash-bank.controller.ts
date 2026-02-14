import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CashBankService } from './cash-bank.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('CashBank')
@ApiBearerAuth()
@Controller({ path: 'cash-bank', version: '1' })
export class CashBankController {
  constructor(private readonly service: CashBankService) {}

  @Get('accounts')
  @RequirePermissions('cash-bank:read')
  @ApiOperation({ summary: 'List bank accounts' })
  async findAll(@CurrentTenant() tenantId: string, @Query('companyId') companyId?: string) {
    return { data: await this.service.findAll(tenantId, companyId) };
  }

  @Get('accounts/:id')
  @RequirePermissions('cash-bank:read')
  @ApiOperation({ summary: 'Get bank account by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('accounts')
  @RequirePermissions('cash-bank:write')
  @ApiOperation({ summary: 'Create bank account' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return { data: await this.service.create(tenantId, dto) };
  }

  @Put('accounts/:id')
  @RequirePermissions('cash-bank:write')
  @ApiOperation({ summary: 'Update bank account' })
  async update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return { data: await this.service.update(tenantId, id, dto) };
  }
}
