import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RevenueRecognitionService } from './revenue-recognition.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('RevenueRecognition')
@ApiBearerAuth()
@Controller({ path: 'revenue-recognition', version: '1' })
export class RevenueRecognitionController {
  constructor(private readonly service: RevenueRecognitionService) {}

  @Get()
  @RequirePermissions('rev-rec:read')
  @ApiOperation({ summary: 'List rev-rec schedules' })
  async findAll(@CurrentTenant() tenantId: string, @Query('contractId') contractId?: string) {
    return { data: await this.service.findAll(tenantId, contractId) };
  }

  @Get(':id')
  @RequirePermissions('rev-rec:read')
  @ApiOperation({ summary: 'Get rev-rec schedule by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('rev-rec:write')
  @ApiOperation({ summary: 'Create rev-rec schedule' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return { data: await this.service.create(tenantId, dto) };
  }

  @Put(':id')
  @RequirePermissions('rev-rec:write')
  @ApiOperation({ summary: 'Update rev-rec schedule' })
  async update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return { data: await this.service.update(tenantId, id, dto) };
  }
}
