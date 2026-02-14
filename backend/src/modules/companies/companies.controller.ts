import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Get()
  @RequirePermissions('companies:read')
  @ApiOperation({ summary: 'List companies' })
  async findAll(@CurrentTenant() tenantId: string) {
    return { data: await this.service.findAll(tenantId) };
  }

  @Get(':id')
  @RequirePermissions('companies:read')
  @ApiOperation({ summary: 'Get company by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('companies:create')
  @ApiOperation({ summary: 'Create a company' })
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch(':id')
  @RequirePermissions('companies:update')
  @ApiOperation({ summary: 'Update a company' })
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }

  @Delete(':id')
  @RequirePermissions('companies:delete')
  @ApiOperation({ summary: 'Soft-delete a company' })
  async remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(tenantId, id);
    return { message: 'Company deleted' };
  }
}
