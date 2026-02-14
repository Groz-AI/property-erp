import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HrService } from './hr.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('HR')
@ApiBearerAuth()
@Controller({ path: 'hr', version: '1' })
export class HrController {
  constructor(private readonly service: HrService) {}

  @Get('employees')
  @RequirePermissions('hr:read')
  @ApiOperation({ summary: 'List employees' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  async findAll(@CurrentTenant() tenantId: string, @Query('department') department?: string, @Query('isActive') isActive?: string) {
    return { data: await this.service.findAll(tenantId, { department, isActive: isActive === undefined ? undefined : isActive === 'true' }) };
  }

  @Get('employees/:id')
  @RequirePermissions('hr:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('employees')
  @RequirePermissions('hr:create')
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch('employees/:id')
  @RequirePermissions('hr:update')
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }

  @Patch('employees/:id/terminate')
  @RequirePermissions('hr:update')
  @ApiOperation({ summary: 'Terminate an employee' })
  async terminate(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body('terminationDate') terminationDate: string) {
    return { data: await this.service.terminate(tenantId, id, new Date(terminationDate), userId) };
  }
}
