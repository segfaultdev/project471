import { Controller, Get, Param, Patch, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Get all notifications
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  // Get notifications for a specific buyer
  @Get('buyer/:buyerId')
  findByBuyer(@Param('buyerId') buyerId: string) {
    return this.notificationsService.findByBuyer(buyerId);
  }

  // Mark as read
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // Delete notification
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}