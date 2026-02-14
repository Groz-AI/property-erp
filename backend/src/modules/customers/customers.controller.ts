import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller({ path: 'customers', version: '1' })
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'List customers' })
  @ApiQuery({ name: 'kycStatus', required: false })
  @ApiQuery({ name: 'phone', required: false })
  async findAll(@CurrentTenant() tenantId: string, @Query('kycStatus') kycStatus?: string, @Query('phone') phone?: string) {
    return { data: await this.service.findAll(tenantId, { kycStatus, phone }) };
  }

  @Get(':id')
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('customers:create')
  @ApiOperation({ summary: 'Create a customer' })
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch(':id')
  @RequirePermissions('customers:update')
  @ApiOperation({ summary: 'Update a customer' })
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }

  @Delete(':id')
  @RequirePermissions('customers:delete')
  @ApiOperation({ summary: 'Soft-delete a customer' })
  async remove(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(tenantId, id);
    return { message: 'Customer deleted' };
  }
}
