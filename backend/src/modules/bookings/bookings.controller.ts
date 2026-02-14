import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingService } from './services/booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';
import { BookingStatus } from '../../shared/enums';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(private readonly service: BookingService) {}

  @Get()
  @RequirePermissions('bookings:read')
  @ApiOperation({ summary: 'List bookings with filters' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'projectId', required: false })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: BookingStatus,
    @Query('projectId') projectId?: string,
  ) {
    const data = await this.service.findAll(tenantId, { status, projectId });
    return { data };
  }

  @Get(':id')
  @RequirePermissions('bookings:read')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(tenantId, id);
    return { data };
  }

  @Post()
  @RequirePermissions('bookings:create')
  @ApiOperation({ summary: 'Create a booking (with advisory lock concurrency)' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    const data = await this.service.create(tenantId, dto, userId);
    return { data };
  }

  @Patch(':id/cancel')
  @RequirePermissions('bookings:update')
  @ApiOperation({ summary: 'Cancel an active booking' })
  async cancel(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    const data = await this.service.cancel(tenantId, id, reason, userId);
    return { data };
  }
}
