import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectCostingService } from './project-costing.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Project Costing')
@ApiBearerAuth()
@Controller({ path: 'project-costing', version: '1' })
export class ProjectCostingController {
  constructor(private readonly service: ProjectCostingService) {}

  @Get('wbs')
  @RequirePermissions('wbs:read')
  @ApiOperation({ summary: 'List WBS items' })
  @ApiQuery({ name: 'projectId', required: false })
  async findAll(@CurrentTenant() tenantId: string, @Query('projectId') projectId?: string) {
    return { data: await this.service.findAll(tenantId, projectId) };
  }

  @Get('wbs/:id')
  @RequirePermissions('wbs:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('wbs')
  @RequirePermissions('wbs:create')
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch('wbs/:id')
  @RequirePermissions('wbs:update')
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }
}
