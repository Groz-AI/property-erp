import { Controller, Get, Patch, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentTenant, CurrentUser, RequirePermissions } from '../../common/decorators/tenant.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  async findAll(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    const data = await this.service.findAll(tenantId, userId);
    const unreadCount = await this.service.unreadCount(tenantId, userId);
    return { data, meta: { unreadCount } };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.markRead(tenantId, id);
    return { message: 'Notification marked as read' };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    await this.service.markAllRead(tenantId, userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dismiss a notification' })
  async dismiss(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.service.dismiss(tenantId, id);
    return { message: 'Notification dismissed' };
  }
}
