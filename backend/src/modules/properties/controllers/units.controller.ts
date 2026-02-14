import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UnitsService } from '../services/units.service';
import { UnitStateMachineService } from '../services/unit-state-machine.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../../common/decorators/tenant.decorator';
import { UnitStatus } from '../../../shared/enums';

@ApiTags('Units')
@ApiBearerAuth()
@Controller({ path: 'units', version: '1' })
export class UnitsController {
  constructor(
    private readonly service: UnitsService,
    private readonly stateMachine: UnitStateMachineService,
  ) {}

  @Get()
  @RequirePermissions('units:read')
  @ApiOperation({ summary: 'List units with filters' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: UnitStatus })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: UnitStatus,
    @Query('type') type?: string,
  ) {
    const data = await this.service.findAll(tenantId, { projectId, status, type });
    return { data };
  }

  @Get(':id')
  @RequirePermissions('units:read')
  @ApiOperation({ summary: 'Get unit by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    const unit = await this.service.findOne(tenantId, id);
    const transitions = this.stateMachine.getAvailableTransitions(unit.status);
    return { data: unit, meta: { availableTransitions: transitions } };
  }

  @Get('summary/:projectId')
  @RequirePermissions('units:read')
  @ApiOperation({ summary: 'Get unit availability summary for a project' })
  async summary(@CurrentTenant() tenantId: string, @Param('projectId', ParseUUIDPipe) projectId: string) {
    const data = await this.service.getAvailabilitySummary(tenantId, projectId);
    return { data };
  }

  @Post()
  @RequirePermissions('units:create')
  @ApiOperation({ summary: 'Create a new unit' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const data = await this.service.create(tenantId, body, userId);
    return { data };
  }

  @Patch(':id')
  @RequirePermissions('units:update')
  @ApiOperation({ summary: 'Update a unit' })
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const data = await this.service.update(tenantId, id, body, userId);
    return { data };
  }
}
