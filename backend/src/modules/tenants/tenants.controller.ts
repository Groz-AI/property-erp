import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller({ path: 'tenants', version: '1' })
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Get()
  @RequirePermissions('tenants:read')
  @ApiOperation({ summary: 'List all tenants (system admin only)' })
  async findAll() {
    const data = await this.service.findAll();
    return { data };
  }

  @Get(':id')
  @RequirePermissions('tenants:read')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @Post()
  @RequirePermissions('tenants:create')
  @ApiOperation({ summary: 'Create a new tenant' })
  async create(@Body() body: any) {
    const data = await this.service.create(body);
    return { data };
  }

  @Patch(':id')
  @RequirePermissions('tenants:update')
  @ApiOperation({ summary: 'Update a tenant' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    const data = await this.service.update(id, body);
    return { data };
  }
}
