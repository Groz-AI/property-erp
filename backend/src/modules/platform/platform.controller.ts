import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PlatformService, CreateTenantDto } from './platform.service';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@ApiTags('Platform Admin')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller({ path: 'platform', version: '1' })
export class PlatformController {
  constructor(private readonly service: PlatformService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  async getStats() {
    const data = await this.service.getPlatformStats();
    return { data };
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List all tenants with stats' })
  async listTenants() {
    const data = await this.service.listTenants();
    return { data };
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Get tenant details with stats' })
  async getTenant(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.getTenant(id);
    return { data };
  }

  @Post('tenants')
  @ApiOperation({ summary: 'Create a new tenant with admin user and default data' })
  async createTenant(@Body() dto: CreateTenantDto) {
    const data = await this.service.createTenant(dto);
    return { data };
  }

  @Patch('tenants/:id')
  @ApiOperation({ summary: 'Update tenant details' })
  async updateTenant(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    const data = await this.service.updateTenant(id, body);
    return { data };
  }

  @Patch('tenants/:id/activate')
  @ApiOperation({ summary: 'Activate a tenant' })
  async activateTenant(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.activateTenant(id);
    return { data };
  }

  @Patch('tenants/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a tenant (blocks all user access)' })
  async deactivateTenant(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.deactivateTenant(id);
    return { data };
  }

  @Get('tenants/:id/users')
  @ApiOperation({ summary: 'List all users for a tenant' })
  async getTenantUsers(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.getTenantUsers(id);
    return { data };
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Activate a user account' })
  async activateUser(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.toggleUserActive(id, true);
    return { data };
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user account' })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.toggleUserActive(id, false);
    return { data };
  }
}
