import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Pricing')
@ApiBearerAuth()
@Controller({ path: 'pricing', version: '1' })
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Get('price-lists')
  @RequirePermissions('pricing:read')
  @ApiOperation({ summary: 'List price lists' })
  async findAll(@CurrentTenant() tenantId: string, @Query('projectId') projectId?: string) {
    return { data: await this.service.findAll(tenantId, projectId) };
  }

  @Get('price-lists/:id')
  @RequirePermissions('pricing:read')
  @ApiOperation({ summary: 'Get price list by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('price-lists')
  @RequirePermissions('pricing:write')
  @ApiOperation({ summary: 'Create price list' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return { data: await this.service.create(tenantId, dto) };
  }

  @Put('price-lists/:id')
  @RequirePermissions('pricing:write')
  @ApiOperation({ summary: 'Update price list' })
  async update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return { data: await this.service.update(tenantId, id, dto) };
  }
}
