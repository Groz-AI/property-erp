import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller({ path: 'documents', version: '1' })
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'List documents by entity' })
  @ApiQuery({ name: 'entityType', required: true })
  @ApiQuery({ name: 'entityId', required: true })
  async findByEntity(@CurrentTenant() tenantId: string, @Query('entityType') entityType: string, @Query('entityId') entityId: string) {
    return { data: await this.service.findByEntity(tenantId, entityType, entityId) };
  }

  @Get(':id')
  @RequirePermissions('documents:read')
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.service.findOne(tenantId, id) };
  }

  @Post()
  @RequirePermissions('documents:create')
  @ApiOperation({ summary: 'Create document record (after S3 upload)' })
  async create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return { data: await this.service.create(tenantId, body, userId) };
  }
}
