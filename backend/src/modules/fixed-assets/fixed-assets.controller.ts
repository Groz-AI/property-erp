import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FixedAssetsService } from './fixed-assets.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('FixedAssets')
@ApiBearerAuth()
@Controller({ path: 'fixed-assets', version: '1' })
export class FixedAssetsController {
  constructor(private readonly service: FixedAssetsService) {}

  @Get()
  @RequirePermissions('fixed-assets:read')
  @ApiOperation({ summary: 'List fixed assets' })
  async findAll(@CurrentTenant() tenantId: string, @Query('category') category?: string, @Query('status') status?: string) {
    return { data: await this.service.findAll(tenantId, { category, status }) };
  }

  @Get(':id')
  @RequirePermissions('fixed-assets:read')
  @ApiOperation({ summary: 'Get fixed asset by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('fixed-assets:write')
  @ApiOperation({ summary: 'Create fixed asset' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return { data: await this.service.create(tenantId, dto) };
  }

  @Put(':id')
  @RequirePermissions('fixed-assets:write')
  @ApiOperation({ summary: 'Update fixed asset' })
  async update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return { data: await this.service.update(tenantId, id, dto) };
  }
}
