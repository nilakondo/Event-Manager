import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post(':eventId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  send(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body('message') message: string,
  ) {
    return this.service.sendNotificationToAttendees(eventId, message);
  }

  @Get()
  getUserNotifications(@Req() req) {
    return this.service.getUserNotifications(req.user.sub);
  }

// In the Controller
@Get(':id')
getSingleNotification(@Param('id', ParseIntPipe) id: number, @Req() req) {
  console.log('📩 Controller → Notification ID:', id);
  console.log('👤 Controller → User ID from req.user:', req.user.sub); // This will give the user ID

  return this.service.getSingleNotification(id, req.user.sub);
}




}
