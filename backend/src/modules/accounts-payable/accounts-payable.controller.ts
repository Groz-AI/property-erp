import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountsPayableService } from './accounts-payable.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('AccountsPayable')
@ApiBearerAuth()
@Controller({ path: 'accounts-payable', version: '1' })
export class AccountsPayableController {
  constructor(private readonly service: AccountsPayableService) {}

  @Get('invoices')
  @RequirePermissions('ap:read')
  @ApiOperation({ summary: 'List AP invoices' })
  async findAll(@CurrentTenant() tenantId: string, @Query('vendorId') vendorId?: string, @Query('status') status?: string) {
    return { data: await this.service.findAll(tenantId, { vendorId, status }) };
  }

  @Get('invoices/:id')
  @RequirePermissions('ap:read')
  @ApiOperation({ summary: 'Get AP invoice by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('invoices')
  @RequirePermissions('ap:write')
  @ApiOperation({ summary: 'Create AP invoice' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return { data: await this.service.create(tenantId, dto) };
  }

  @Put('invoices/:id')
  @RequirePermissions('ap:write')
  @ApiOperation({ summary: 'Update AP invoice' })
  async update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return { data: await this.service.update(tenantId, id, dto) };
  }
}
