import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HandoverService } from './handover.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { HandoverStatus } from '../../shared/enums';

@ApiTags('Handover')
@ApiBearerAuth()
@Controller({ path: 'handover', version: '1' })
export class HandoverController {
  constructor(private readonly service: HandoverService) {}

  @Get()
  @RequirePermissions('handover:read')
  @ApiOperation({ summary: 'List handovers' })
  @ApiQuery({ name: 'status', required: false, enum: HandoverStatus })
  async findAll(@CurrentTenant() tenantId: string, @Query('status') status?: HandoverStatus) {
    return { data: await this.service.findAll(tenantId, { status }) };
  }

  @Get(':id')
  @RequirePermissions('handover:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('handover:create')
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch(':id')
  @RequirePermissions('handover:update')
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }
}
