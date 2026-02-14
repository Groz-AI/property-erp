import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { LeadStatus } from '../../shared/enums';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller({ path: 'leads', version: '1' })
export class CrmController {
  constructor(private readonly service: CrmService) {}

  @Get()
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'List leads' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'source', required: false })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: LeadStatus,
    @Query('assignedTo') assignedTo?: string,
    @Query('source') source?: string,
  ) {
    return { data: await this.service.findAll(tenantId, { status, assignedTo, source }) };
  }

  @Get(':id')
  @RequirePermissions('leads:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('leads:create')
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch(':id')
  @RequirePermissions('leads:update')
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }

  @Delete(':id')
  @RequirePermissions('leads:delete')
  async remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(tenantId, id);
    return { message: 'Lead deleted' };
  }
}
