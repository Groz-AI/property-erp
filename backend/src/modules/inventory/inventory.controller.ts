import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller({ path: 'inventory', version: '1' })
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('items')
  @RequirePermissions('inventory:read')
  @ApiOperation({ summary: 'List inventory items' })
  @ApiQuery({ name: 'category', required: false })
  async listItems(@CurrentTenant() tenantId: string, @Query('category') category?: string) {
    return { data: await this.service.findAll(tenantId, category) };
  }

  @Get('items/:id')
  @RequirePermissions('inventory:read')
  async getItem(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post('items')
  @RequirePermissions('inventory:create')
  async createItem(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }

  @Patch('items/:id')
  @RequirePermissions('inventory:update')
  async updateItem(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.update(tenantId, id, body, userId) };
  }
}
