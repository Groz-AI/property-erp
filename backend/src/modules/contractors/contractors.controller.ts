import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContractorsService } from './contractors.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { ClaimStatus } from '../../shared/enums';

@ApiTags('Contractors')
@ApiBearerAuth()
@Controller({ path: 'contractors', version: '1' })
export class ContractorsController {
  constructor(private readonly service: ContractorsService) {}

  @Get()
  @RequirePermissions('contractors:read')
  @ApiOperation({ summary: 'List contractors' })
  async listContractors(@CurrentTenant() tenantId: string) {
    return { data: await this.service.findAllContractors(tenantId) };
  }

  @Get(':id')
  @RequirePermissions('contractors:read')
  async getContractor(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOneContractor(tenantId, id) };
  }

  @Post()
  @RequirePermissions('contractors:create')
  async createContractor(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.createContractor(tenantId, body, userId) };
  }

  @Patch(':id')
  @RequirePermissions('contractors:update')
  async updateContractor(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.updateContractor(tenantId, id, body, userId) };
  }

  @Get('claims')
  @RequirePermissions('claims:read')
  @ApiOperation({ summary: 'List progress claims' })
  @ApiQuery({ name: 'status', required: false, enum: ClaimStatus })
  @ApiQuery({ name: 'contractorId', required: false })
  async listClaims(@CurrentTenant() tenantId: string, @Query('status') status?: ClaimStatus, @Query('contractorId') contractorId?: string) {
    return { data: await this.service.findAllClaims(tenantId, { status, contractorId }) };
  }

  @Get('claims/:id')
  @RequirePermissions('claims:read')
  async getClaim(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOneClaim(tenantId, id) };
  }

  @Post('claims')
  @RequirePermissions('claims:create')
  async createClaim(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.createClaim(tenantId, body, userId) };
  }

  @Patch('claims/:id')
  @RequirePermissions('claims:update')
  async updateClaim(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return { data: await this.service.updateClaim(tenantId, id, body, userId) };
  }
}
