import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { CurrentTenant, RequirePermissions, CurrentUser } from '../../common/decorators/tenant.decorator';

@ApiTags('Approvals')
@ApiBearerAuth()
@Controller({ path: 'approvals', version: '1' })
export class ApprovalsController {
  constructor(private readonly service: ApprovalsService) {}

  @Get()
  @RequirePermissions('approvals:read')
  @ApiOperation({ summary: 'List approval requests' })
  async findAll(@CurrentTenant() tenantId: string, @Query('status') status?: any, @Query('assignedTo') assignedTo?: string) {
    return { data: await this.service.findAll(tenantId, { status, assignedTo }) };
  }

  @Get(':id')
  @RequirePermissions('approvals:read')
  @ApiOperation({ summary: 'Get approval request by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('approvals:write')
  @ApiOperation({ summary: 'Create approval request' })
  async create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return { data: await this.service.create(tenantId, dto) };
  }

  @Put(':id/resolve')
  @RequirePermissions('approvals:write')
  @ApiOperation({ summary: 'Resolve approval request' })
  async resolve(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any, @CurrentUser('id') userId: string) {
    return { data: await this.service.resolve(tenantId, id, dto.status, dto.comments, userId) };
  }
}
