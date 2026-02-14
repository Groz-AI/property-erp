import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Payroll')
@ApiBearerAuth()
@Controller({ path: 'payroll', version: '1' })
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @Get('payslips')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'List payslips' })
  @ApiQuery({ name: 'periodMonth', required: false })
  @ApiQuery({ name: 'periodYear', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('periodMonth') periodMonth?: string,
    @Query('periodYear') periodYear?: string,
    @Query('status') status?: string,
  ) {
    return {
      data: await this.service.findAll(tenantId, {
        periodMonth: periodMonth ? parseInt(periodMonth, 10) : undefined,
        periodYear: periodYear ? parseInt(periodYear, 10) : undefined,
        status,
      }),
    };
  }

  @Get('payslips/:id')
  @RequirePermissions('payroll:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('payslips')
  @RequirePermissions('payroll:create')
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch('payslips/:id')
  @RequirePermissions('payroll:update')
  async update(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }
}
