import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response as ExpressResponse } from 'express';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { CreateTelegramUserDto, CreateUserDto, LoginDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('auth')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description: 'Создает новый аккаунт пользователя с email и паролем',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'username' },
            subscription_type: {
              type: 'string',
              enum: ['FREE', 'PREMIUM', 'VIP'],
            },
            auth_type: { type: 'string', enum: ['EMAIL', 'TELEGRAM'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        access_token: { type: 'string', example: 'jwt-token' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
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
  @ApiOperation({
    summary: 'Вход в систему',
    description: 'Аутентификация пользователя по email и паролю',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Вход выполнен успешно',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'username' },
            subscription_type: {
              type: 'string',
              enum: ['FREE', 'PREMIUM', 'VIP'],
            },
            auth_type: { type: 'string', enum: ['EMAIL', 'TELEGRAM'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string', example: 'Вход выполнен успешно' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
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
  @ApiOperation({
    summary: 'Получить профиль пользователя',
    description:
      'Возвращает информацию о текущем пользователе или статус аутентификации',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе получена',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            authenticated: { type: 'boolean', example: true },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                email: { type: 'string', example: 'user@example.com' },
                username: { type: 'string', example: 'username' },
                subscription_type: {
                  type: 'string',
                  enum: ['FREE', 'PREMIUM', 'VIP'],
                },
                auth_type: { type: 'string', enum: ['EMAIL', 'TELEGRAM'] },
                created_at: { type: 'string', format: 'date-time' },
              },
            },
            shouldHideAds: { type: 'boolean', example: true },
          },
        },
        {
          type: 'object',
          properties: {
            authenticated: { type: 'boolean', example: false },
            message: {
              type: 'string',
              example: 'Пользователь не аутентифицирован',
            },
            shouldHideAds: { type: 'boolean', example: false },
          },
        },
      ],
    },
  })
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
