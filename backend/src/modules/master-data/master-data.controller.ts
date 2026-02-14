import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Master Data')
@ApiBearerAuth()
@Controller({ path: 'master-data', version: '1' })
export class MasterDataController {
  constructor(private readonly service: MasterDataService) {}

  @Get('currencies')
  @RequirePermissions('master-data:read')
  @ApiOperation({ summary: 'List currencies' })
  async getCurrencies(@CurrentTenant() tenantId: string) {
    return { data: await this.service.getCurrencies(tenantId) };
  }

  @Get('exchange-rates')
  @RequirePermissions('master-data:read')
  @ApiOperation({ summary: 'Get latest exchange rates' })
  async getExchangeRates(@CurrentTenant() tenantId: string) {
    return { data: await this.service.getExchangeRates(tenantId) };
  }

  @Get('tax-rules')
  @RequirePermissions('master-data:read')
  @ApiOperation({ summary: 'List active tax rules' })
  async getTaxRules(@CurrentTenant() tenantId: string) {
    return { data: await this.service.getTaxRules(tenantId) };
  }

  @Get('settings')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'List settings' })
  @ApiQuery({ name: 'companyId', required: false })
  async getSettings(@CurrentTenant() tenantId: string, @Query('companyId') companyId?: string) {
    return { data: await this.service.getSettings(tenantId, companyId) };
  }

  @Post('settings')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Upsert a setting' })
  async upsertSetting(@CurrentTenant() tenantId: string, @Body() body: { key: string; value: any; companyId?: string }) {
    await this.service.upsertSetting(tenantId, body.key, body.value, body.companyId);
    return { message: 'Setting saved' };
  }
}
