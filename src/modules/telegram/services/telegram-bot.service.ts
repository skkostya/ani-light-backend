import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Telegraf } from 'telegraf';
import { UserService } from '../../user/user.service';

/**
 * Сервис для работы с Telegram ботом
 * Обрабатывает команды, кнопки и действия пользователей
 */
@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: Telegraf | null = null;
  private readonly frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  async onModuleInit() {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN не настроен. Telegram бот не будет запущен.',
      );
      return;
    }

    // Запускаем бота асинхронно, не блокируя старт приложения
    this.initializeBot(botToken).catch((error) => {
      this.logger.error('Критическая ошибка при инициализации Telegram бота:', error);
      // Не прерываем запуск приложения, даже если бот не запустился
    });
  }

  /**
   * Асинхронная инициализация бота (не блокирует запуск приложения)
   */
  private async initializeBot(botToken: string): Promise<void> {
    try {
      this.bot = new Telegraf(botToken);
      this.setupHandlers();

      // Проверяем, используется ли webhook (в production обычно используется webhook)
      const useWebhook =
        this.configService.get<string>('TELEGRAM_USE_WEBHOOK') === 'true';

      if (!useWebhook) {
        // Используем polling для получения обновлений (для разработки)
        // Запускаем с таймаутом, чтобы не блокировать старт приложения
        await Promise.race([
          this.bot.launch(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout запуска бота')), 10000),
          ),
        ]);
        this.logger.log('Telegram бот успешно запущен (polling режим)');
      } else {
        this.logger.log('Telegram бот настроен на использование webhook');
      }

      // Graceful stop
      process.once('SIGINT', () => this.bot?.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot?.stop('SIGTERM'));
    } catch (error) {
      this.logger.error('Ошибка при запуске Telegram бота:', error);
      // Не пробрасываем ошибку дальше, чтобы не блокировать запуск приложения
    }
  }

  /**
   * Запуск бота в polling режиме (для разработки)
   */
  async startPolling() {
    if (!this.bot) {
      throw new Error('Бот не инициализирован');
    }
    await this.bot.launch();
    this.logger.log('Telegram бот запущен в polling режиме');
  }

  /**
   * Установка webhook для production
   * @param webhookUrl - URL для webhook
   */
  async setWebhook(webhookUrl: string) {
    if (!this.bot) {
      throw new Error('Бот не инициализирован');
    }
    const botSecret = this.configService.get<string>('TELEGRAM_BOT_SECRET');
    await this.bot.telegram.setWebhook(webhookUrl, {
      secret_token: botSecret,
    });
    this.logger.log(`Webhook установлен: ${webhookUrl}`);
  }

  /**
   * Настройка обработчиков команд и действий
   */
  private setupHandlers() {
    if (!this.bot) return;

    // Команда /start
    this.bot.command('start', async (ctx: Context) => {
      await this.handleStartCommand(ctx);
    });

    // Команда /help
    this.bot.command('help', async (ctx: Context) => {
      await this.handleHelpCommand(ctx);
    });

    // Обработка callback кнопок
    this.bot.action(/^auth_(.+)$/, async (ctx: Context) => {
      await this.handleAuthButton(ctx);
    });

    // Обработка кнопки помощи
    this.bot.action('help', async (ctx: Context) => {
      await this.handleHelpCommand(ctx);
    });

    // Обработка ошибок
    this.bot.catch((err, ctx) => {
      this.logger.error(`Ошибка для обновления ${ctx.update.update_id}:`, err);
    });
  }

  /**
   * Обработка команды /start
   */
  private async handleStartCommand(ctx: Context) {
    try {
      const userId = ctx.from?.id;
      const username =
        ctx.from?.username || ctx.from?.first_name || 'пользователь';
      const firstName = ctx.from?.first_name;
      const lastName = ctx.from?.last_name;

      if (!userId) {
        await ctx.reply('Не удалось получить данные пользователя.');
        return;
      }

      // Регистрируем пользователя (если его еще нет) или обновляем данные
      await this.userService.registerTelegramUser({
        telegram_id: userId.toString(),
        username: username || `user_${userId}`,
        first_name: firstName,
        last_name: lastName,
      });

      const message =
        `👋 Привет, ${username}!\n\n` +
        `Вы успешно авторизованы. Нажмите кнопку ниже, чтобы открыть платформу.`;

      // Генерируем краткоживущий временный токен для обмена на бекенде
      const tempToken = this.userService.issueTelegramTemporaryToken(
        userId.toString(),
      );
      // Создаем кнопку для открытия платформы с временным токеном
      const authUrl = this.generateAuthUrlWithTempToken(tempToken);

      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть платформу',
                web_app: { url: authUrl },
              },
            ],
            [
              {
                text: '📖 Помощь',
                callback_data: 'help',
              },
            ],
          ],
        },
      });
    } catch (error) {
      this.logger.error('Ошибка при обработке команды /start:', error);
      await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  }

  /**
   * Обработка команды /help
   */
  private async handleHelpCommand(ctx: Context) {
    const helpText = `
📖 *Помощь по использованию бота*

*Доступные команды:*
/start - Начать работу с ботом
/help - Показать эту справку

*Как пользоваться:*
1. Нажмите кнопку "Открыть платформу" в сообщении бота
2. Вы будете автоматически зарегистрированы и авторизованы
3. Наслаждайтесь просмотром аниме!

*Что делать, если возникли проблемы?*
- Убедитесь, что у вас установлена последняя версия Telegram
- Попробуйте перезапустить бота командой /start
- Свяжитесь с поддержкой, если проблема не решается
    `.trim();

    await ctx.reply(helpText, { parse_mode: 'Markdown' });
  }

  /**
   * Обработка нажатия на кнопку авторизации
   */
  private async handleAuthButton(ctx: Context) {
    try {
      const userId = ctx.from?.id;
      const username =
        ctx.from?.username || ctx.from?.first_name || `user_${userId}`;
      const firstName = ctx.from?.first_name;
      const lastName = ctx.from?.last_name;

      if (!userId) {
        await ctx.answerCbQuery('Не удалось получить данные пользователя.');
        return;
      }

      // Регистрируем пользователя (если его еще нет) или обновляем данные
      await this.userService.registerTelegramUser({
        telegram_id: userId.toString(),
        username,
        first_name: firstName,
        last_name: lastName,
      });

      // Генерируем временный токен и формируем URL
      const tempToken = this.userService.issueTelegramTemporaryToken(
        userId.toString(),
      );
      const authUrl = this.generateAuthUrlWithTempToken(tempToken);

      await ctx.answerCbQuery('Открываем платформу...');

      // Отправляем сообщение с кнопкой WebApp
      await ctx.reply('Нажмите на кнопку ниже, чтобы открыть платформу:', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть платформу',
                web_app: { url: authUrl },
              },
            ],
          ],
        },
      });
    } catch (error) {
      this.logger.error('Ошибка при обработке кнопки авторизации:', error);
      await ctx.answerCbQuery('Произошла ошибка. Попробуйте позже.');
    }
  }

  /**
   * Генерация URL фронтенда с временным токеном для обмена на бекенде
   */
  private generateAuthUrlWithTempToken(tempToken: string): string {
    const params = new URLSearchParams({
      source: 'bot',
      auto_auth: 'true',
      temp_token: tempToken,
    });
    return `${this.frontendUrl}/ru/auth/telegram?${params.toString()}`;
  }

  /**
   * Генерация временного токена для быстрой авторизации
   * Можно использовать для одноразовой авторизации через ссылку
   */
  async generateAuthToken(telegramId: string): Promise<string> {
    try {
      // Пытаемся залогинить по telegram_id
      const authResult = await this.userService.loginTelegramUser(telegramId);
      return authResult.access_token;
    } catch {
      // Если пользователь не зарегистрирован, возвращаем пустую строку
      return '';
    }
  }

  /**
   * Отправка сообщения пользователю
   * @param telegramId - Telegram ID пользователя
   * @param message - Текст сообщения
   */
  async sendMessage(telegramId: string, message: string): Promise<void> {
    if (!this.bot) {
      this.logger.warn('Бот не инициализирован. Сообщение не отправлено.');
      return;
    }

    try {
      await this.bot.telegram.sendMessage(telegramId, message);
    } catch (error) {
      this.logger.error(
        `Ошибка при отправке сообщения пользователю ${telegramId}:`,
        error,
      );
    }
  }

  /**
   * Получение экземпляра бота (для тестирования)
   */
  getBot(): Telegraf | null {
    return this.bot;
  }
}
