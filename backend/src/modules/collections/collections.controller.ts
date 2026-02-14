import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { ReceiptStatus } from '../../shared/enums';

@ApiTags('Receipts')
@ApiBearerAuth()
@Controller({ path: 'receipts', version: '1' })
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  @Get()
  @RequirePermissions('receipts:read')
  @ApiOperation({ summary: 'List receipts' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ReceiptStatus })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('customerId') customerId?: string,
    @Query('contractId') contractId?: string,
    @Query('status') status?: ReceiptStatus,
  ) {
    return { data: await this.service.findAllReceipts(tenantId, { customerId, contractId, status }) };
  }

  @Get(':id')
  @RequirePermissions('receipts:read')
  @ApiOperation({ summary: 'Get receipt by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOneReceipt(tenantId, id) };
  }

  @Post()
  @RequirePermissions('receipts:create')
  @ApiOperation({ summary: 'Create a receipt with installment allocations' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { receipt: any; allocations: { installmentId: string; amount: number }[] },
  ) {
    return { data: await this.service.createReceipt(tenantId, body.receipt, body.allocations, userId) };
  }

  @Patch(':id/confirm')
  @RequirePermissions('receipts:update')
  @ApiOperation({ summary: 'Confirm a draft receipt' })
  async confirm(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.confirmReceipt(tenantId, id, userId) };
  }
}
