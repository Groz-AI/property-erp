import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrokersService } from './brokers.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Brokers')
@ApiBearerAuth()
@Controller({ path: 'brokers', version: '1' })
export class BrokersController {
  constructor(private readonly service: BrokersService) {}

  @Get()
  @RequirePermissions('brokers:read')
  @ApiOperation({ summary: 'List brokers' })
  async findAll(@CurrentTenant() tenantId: string) {
    return { data: await this.service.findAll(tenantId) };
  }

  @Get(':id')
  @RequirePermissions('brokers:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('brokers:create')
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch(':id')
  @RequirePermissions('brokers:update')
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }

  @Delete(':id')
  @RequirePermissions('brokers:delete')
  async remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(tenantId, id);
    return { message: 'Broker deleted' };
  }
}
