import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'List roles' })
  async findAll(@CurrentTenant() tenantId: string) {
    return { data: await this.service.findAll(tenantId) };
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('roles:create')
  async create(@CurrentTenant() tenantId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body) };
  }

  @Patch(':id')
  @RequirePermissions('roles:update')
  async update(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body) };
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  async remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(tenantId, id);
    return { message: 'Role deleted' };
  }
}
