import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UserService } from '../../user/user.service';
import { ExchangeTelegramTokenDto } from '../dto/exchange-telegram-token.dto';
import { TelegramBotService } from '../services/telegram-bot.service';

/**
 * Контроллер для обработки webhook от Telegram
 * Используется вместо polling в production
 */
@ApiTags('telegram')
@Controller('telegram')
export class TelegramBotController {
  private readonly logger = new Logger(TelegramBotController.name);
  private readonly botSecret: string;

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.botSecret =
      this.configService.get<string>('TELEGRAM_BOT_SECRET') || '';
  }

  /**
   * Webhook endpoint для получения обновлений от Telegram
   * Используется в production вместо polling
   */
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      // Проверка секретного токена (если настроен)
      if (this.botSecret) {
        const secretHeader = req.headers['x-telegram-bot-api-secret-token'];
        if (secretHeader !== this.botSecret) {
          this.logger.warn('Неверный секретный токен для webhook');
          return res.status(403).send('Forbidden');
        }
      }

      const bot = this.telegramBotService.getBot();
      if (!bot) {
        this.logger.error('Бот не инициализирован');
        return res.status(500).send('Bot not initialized');
      }

      // Обрабатываем обновление через бота
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      this.logger.error('Ошибка при обработке webhook:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  /**
   * Endpoint для получения информации о боте (для тестирования)
   */
  @Post('info')
  async getBotInfo(@Res() res: Response) {
    const bot = this.telegramBotService.getBot();
    if (!bot) {
      return res.status(503).json({
        status: 'unavailable',
        message: 'Бот не инициализирован',
      });
    }

    try {
      const botInfo = await bot.telegram.getMe();
      res.json({
        status: 'active',
        bot: botInfo,
      });
    } catch (error) {
      this.logger.error('Ошибка при получении информации о боте:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * Обмен временного токена (из Telegram Mini App/бота) на обычный JWT токен
   */
  @Post('auth/exchange')
  @ApiOperation({
    summary: 'Обмен временного токена Telegram на JWT',
  })
  @ApiResponse({
    status: 201,
    description: 'Возвращает пользователя и access_token',
  })
  @ApiResponse({
    status: 401,
    description: 'Временный токен невалиден или истек',
  })
  async exchangeTemporaryToken(
    @Body() body: ExchangeTelegramTokenDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.userService.exchangeTelegramTemporaryToken(
        body.temp_token,
      );

      this.setAuthCookie(res, result.access_token);

      return res.json({
        user: result.user,
        message: 'Вход выполнен успешно',
      });
    } catch (error) {
      this.logger.warn('Ошибка обмена временного токена:', error?.message);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  /**
   * Устанавливает JWT токен в httpOnly cookie
   */
  private setAuthCookie(res: Response, token: string) {
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
