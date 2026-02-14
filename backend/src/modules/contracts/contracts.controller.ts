import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { ContractStatus } from '../../shared/enums';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller({ path: 'contracts', version: '1' })
export class ContractsController {
  constructor(private readonly service: ContractsService) {}

  @Get()
  @RequirePermissions('contracts:read')
  @ApiOperation({ summary: 'List contracts' })
  @ApiQuery({ name: 'status', required: false, enum: ContractStatus })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: ContractStatus,
    @Query('customerId') customerId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return { data: await this.service.findAll(tenantId, { status, customerId, projectId }) };
  }

  @Get(':id')
  @RequirePermissions('contracts:read')
  @ApiOperation({ summary: 'Get contract by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('from-booking/:bookingId')
  @RequirePermissions('contracts:create')
  @ApiOperation({ summary: 'Create contract from a booking' })
  async createFromBooking(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() body: any,
  ) {
    return { data: await this.service.createFromBooking(tenantId, bookingId, body, userId) };
  }

  @Patch(':id/sign')
  @RequirePermissions('contracts:update')
  @ApiOperation({ summary: 'Sign a contract' })
  async sign(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.sign(tenantId, id, userId) };
  }

  @Patch(':id/activate')
  @RequirePermissions('contracts:update')
  @ApiOperation({ summary: 'Activate a signed contract' })
  async activate(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.activate(tenantId, id, userId) };
  }

  @Patch(':id/cancel')
  @RequirePermissions('contracts:update')
  @ApiOperation({ summary: 'Cancel a contract' })
  async cancel(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string; fee: number },
  ) {
    return { data: await this.service.cancel(tenantId, id, body.reason, body.fee, userId) };
  }
}
