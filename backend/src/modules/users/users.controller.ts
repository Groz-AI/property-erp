import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'List users' })
  async findAll(@CurrentTenant() tenantId: string) {
    return { data: await this.service.findAll(tenantId) };
  }

  @Get(':id')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Create a user' })
  async create(@CurrentTenant() tenantId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body) };
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Update a user' })
  async update(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body) };
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Deactivate a user' })
  async deactivate(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.deactivate(tenantId, id);
    return { message: 'User deactivated' };
  }
}
