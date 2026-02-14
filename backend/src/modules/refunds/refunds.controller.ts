import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RefundsService } from './refunds.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Refunds')
@ApiBearerAuth()
@Controller({ path: 'refunds', version: '1' })
export class RefundsController {
  constructor(private readonly service: RefundsService) {}

  @Get()
  @RequirePermissions('refunds:read')
  @ApiOperation({ summary: 'List refunds' })
  async findAll(@CurrentTenant() tenantId: string, @Query('customerId') customerId?: string, @Query('status') status?: string) {
    return { data: await this.service.findAll(tenantId, { customerId, status }) };
  }

  @Get(':id')
  @RequirePermissions('refunds:read')
  @ApiOperation({ summary: 'Get refund by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('refunds:write')
  @ApiOperation({ summary: 'Create refund request' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return { data: await this.service.create(tenantId, dto) };
  }

  @Put(':id')
  @RequirePermissions('refunds:write')
  @ApiOperation({ summary: 'Update refund' })
  async update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return { data: await this.service.update(tenantId, id, dto) };
  }
}
