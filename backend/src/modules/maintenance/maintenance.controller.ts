import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { TicketStatus, TicketPriority } from '../../shared/enums';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller({ path: 'maintenance', version: '1' })
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Get('tickets')
  @RequirePermissions('maintenance:read')
  @ApiOperation({ summary: 'List maintenance tickets' })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiQuery({ name: 'priority', required: false, enum: TicketPriority })
  @ApiQuery({ name: 'assignedTo', required: false })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return { data: await this.service.findAll(tenantId, { status, priority, assignedTo }) };
  }

  @Get('tickets/:id')
  @RequirePermissions('maintenance:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('tickets')
  @RequirePermissions('maintenance:create')
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch('tickets/:id')
  @RequirePermissions('maintenance:update')
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }
}
