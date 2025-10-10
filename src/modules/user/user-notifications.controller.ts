import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UpdateUserNotificationsDto,
  UserNotificationsResponseDto,
} from './dto/user-notifications.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('user/notifications')
@UseGuards(JwtAuthGuard)
export class UserNotificationsController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить настройки уведомлений',
    description: 'Возвращает текущие настройки уведомлений пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Настройки уведомлений успешно получены',
    type: UserNotificationsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getNotifications(@Request() req) {
    const user = req.user;
    return {
      notifications_enabled: user.notifications_enabled,
      notifications_telegram_enabled: user.notifications_telegram_enabled,
      notifications_email_enabled: user.notifications_email_enabled,
    };
  }

  @Patch()
  @ApiOperation({
    summary: 'Обновить настройки уведомлений',
    description: 'Обновляет настройки уведомлений пользователя',
  })
  @ApiBody({
    type: UpdateUserNotificationsDto,
    description: 'Новые настройки уведомлений',
  })
  @ApiResponse({
    status: 200,
    description: 'Настройки уведомлений успешно обновлены',
    type: UserNotificationsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  updateNotifications(
    @Request() req,
    @Body() updateDto: UpdateUserNotificationsDto,
  ) {
    return this.userService.updateNotifications(req.user.id, updateDto);
  }
}
