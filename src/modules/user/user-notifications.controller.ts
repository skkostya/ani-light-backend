import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserNotificationsDto } from './dto/user-notifications.dto';
import { UserService } from './user.service';

@Controller('user/notifications')
@UseGuards(JwtAuthGuard)
export class UserNotificationsController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getNotifications(@Request() req) {
    const user = req.user;
    return {
      notifications_enabled: user.notifications_enabled,
      notifications_telegram_enabled: user.notifications_telegram_enabled,
      notifications_email_enabled: user.notifications_email_enabled,
    };
  }

  @Patch()
  updateNotifications(
    @Request() req,
    @Body() updateDto: UpdateUserNotificationsDto,
  ) {
    return this.userService.updateNotifications(req.user.id, updateDto);
  }
}
