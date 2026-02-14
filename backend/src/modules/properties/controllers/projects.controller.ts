import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from '../services/projects.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../../common/decorators/tenant.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  @RequirePermissions('projects:read')
  @ApiOperation({ summary: 'List all projects' })
  async findAll(@CurrentTenant() tenantId: string) {
    const data = await this.service.findAll(tenantId);
    return { data };
  }

  @Get(':id')
  @RequirePermissions('projects:read')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(tenantId, id);
    return { data };
  }

  @Post()
  @RequirePermissions('projects:create')
  @ApiOperation({ summary: 'Create a new project' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const data = await this.service.create(tenantId, body, userId);
    return { data };
  }

  @Patch(':id')
  @RequirePermissions('projects:update')
  @ApiOperation({ summary: 'Update a project' })
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    const data = await this.service.update(tenantId, id, body, userId);
    return { data };
  }

  @Delete(':id')
  @RequirePermissions('projects:delete')
  @ApiOperation({ summary: 'Soft-delete a project' })
  async remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(tenantId, id);
    return { message: 'Project deleted' };
  }
}
