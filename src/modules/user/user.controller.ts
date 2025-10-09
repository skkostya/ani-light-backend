import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response as ExpressResponse } from 'express';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { CreateTelegramUserDto, CreateUserDto, LoginDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Throttle({ short: { limit: 1, ttl: 5000 } }) // Более строгий лимит для регистрации
  async register(
    @Body() createUserDto: CreateUserDto,
    @Response() res: ExpressResponse,
  ) {
    const result = await this.userService.register(createUserDto);

    // Устанавливаем JWT токен в httpOnly cookie
    this.setAuthCookie(res, result.access_token);

    return res.json({
      user: result.user,
      message: 'Регистрация прошла успешно',
    });
  }

  @Post('login')
  @Throttle({ short: { limit: 2, ttl: 5000 } }) // Более строгий лимит для входа
  async login(@Body() loginDto: LoginDto, @Response() res: ExpressResponse) {
    const result = await this.userService.login(loginDto);

    // Устанавливаем JWT токен в httpOnly cookie
    this.setAuthCookie(res, result.access_token);

    return res.json({
      user: result.user,
      message: 'Вход выполнен успешно',
    });
  }

  @Get('profile')
  @UseGuards(OptionalJwtGuard)
  getProfile(@Request() req: any) {
    // Если пользователь не аутентифицирован, возвращаем информацию об этом
    if (!req.user) {
      return {
        authenticated: false,
        message: 'Пользователь не аутентифицирован',
        shouldHideAds: false, // Показываем рекламу неаутентифицированным пользователям
      };
    }

    // Если пользователь аутентифицирован, возвращаем его данные
    return {
      authenticated: true,
      user: req.user,
      shouldHideAds: req.user.shouldHideAds,
    };
  }

  @Post('telegram')
  @Throttle({ short: { limit: 5, ttl: 5000 } }) // Лимит для Telegram авторизации
  async telegramAuth(
    @Body() createTelegramUserDto: CreateTelegramUserDto,
    @Response() res: ExpressResponse,
  ) {
    const result = await this.userService.registerTelegramUser(
      createTelegramUserDto,
    );

    // Устанавливаем JWT токен в httpOnly cookie
    this.setAuthCookie(res, result.access_token);

    return res.json({
      user: result.user,
      message: 'Авторизация через Telegram прошла успешно',
    });
  }

  @Post('logout')
  logout(@Response() res: ExpressResponse) {
    // Очищаем cookie с токеном
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({
      message: 'Выход выполнен успешно',
    });
  }

  /**
   * Устанавливает JWT токен в httpOnly cookie
   */
  private setAuthCookie(res: ExpressResponse, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', token, {
      httpOnly: true, // Защищает от XSS атак
      secure: isProduction, // HTTPS только в продакшене
      sameSite: 'strict', // Защищает от CSRF атак
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней (как в JWT)
      path: '/', // Доступен для всего сайта
    });
  }
}
