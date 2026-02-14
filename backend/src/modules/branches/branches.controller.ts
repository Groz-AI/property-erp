import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller({ path: 'branches', version: '1' })
export class BranchesController {
  constructor(private readonly service: BranchesService) {}

  @Get()
  @RequirePermissions('branches:read')
  @ApiOperation({ summary: 'List branches' })
  @ApiQuery({ name: 'companyId', required: false })
  async findAll(@CurrentTenant() tenantId: string, @Query('companyId') companyId?: string) {
    return { data: await this.service.findAll(tenantId, companyId) };
  }

  @Get(':id')
  @RequirePermissions('branches:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('branches:create')
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch(':id')
  @RequirePermissions('branches:update')
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }

  @Delete(':id')
  @RequirePermissions('branches:delete')
  async remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(tenantId, id);
    return { message: 'Branch deleted' };
  }
}
