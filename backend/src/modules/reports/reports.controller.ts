import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentTenant, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('sales')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Sales report by project' })
  async salesReport(@CurrentTenant() tenantId: string, @Query('from') from?: string, @Query('to') to?: string, @Query('projectId') projectId?: string) {
    return { data: await this.service.getSalesReport(tenantId, { from, to, projectId }) };
  }

  @Get('collections')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Collections report by month' })
  async collectionsReport(@CurrentTenant() tenantId: string, @Query('from') from?: string, @Query('to') to?: string) {
    return { data: await this.service.getCollectionsReport(tenantId, { from, to }) };
  }

  @Get('aging')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Installment aging report' })
  async agingReport(@CurrentTenant() tenantId: string) {
    return { data: await this.service.getAgingReport(tenantId) };
  }
}
