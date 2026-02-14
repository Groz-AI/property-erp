import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { POStatus } from '../../shared/enums';

@ApiTags('Procurement')
@ApiBearerAuth()
@Controller({ path: 'procurement', version: '1' })
export class ProcurementController {
  constructor(private readonly service: ProcurementService) {}

  // ── Vendors ──
  @Get('vendors')
  @RequirePermissions('vendors:read')
  @ApiOperation({ summary: 'List vendors' })
  async listVendors(@CurrentTenant() tenantId: string) {
    return { data: await this.service.findAllVendors(tenantId) };
  }

  @Get('vendors/:id')
  @RequirePermissions('vendors:read')
  async getVendor(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOneVendor(tenantId, id) };
  }

  @Post('vendors')
  @RequirePermissions('vendors:create')
  async createVendor(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.createVendor(tenantId, body, userId) };
  }

  @Patch('vendors/:id')
  @RequirePermissions('vendors:update')
  async updateVendor(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.updateVendor(tenantId, id, body, userId) };
  }

  // ── Purchase Orders ──
  @Get('purchase-orders')
  @RequirePermissions('procurement:read')
  @ApiOperation({ summary: 'List purchase orders' })
  @ApiQuery({ name: 'status', required: false, enum: POStatus })
  @ApiQuery({ name: 'vendorId', required: false })
  async listPOs(@CurrentTenant() tenantId: string, @Query('status') status?: POStatus, @Query('vendorId') vendorId?: string) {
    return { data: await this.service.findAllPOs(tenantId, { status, vendorId }) };
  }

  @Get('purchase-orders/:id')
  @RequirePermissions('procurement:read')
  async getPO(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOnePO(tenantId, id) };
  }

  @Post('purchase-orders')
  @RequirePermissions('procurement:create')
  async createPO(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.createPO(tenantId, body, userId) };
  }

  @Patch('purchase-orders/:id')
  @RequirePermissions('procurement:update')
  async updatePO(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.updatePO(tenantId, id, body, userId) };
  }
}
