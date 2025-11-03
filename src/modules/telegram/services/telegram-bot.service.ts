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

    try {
      this.bot = new Telegraf(botToken);
      this.setupHandlers();

      // Проверяем, используется ли webhook (в production обычно используется webhook)
      const useWebhook =
        this.configService.get<string>('TELEGRAM_USE_WEBHOOK') === 'true';

      if (!useWebhook) {
        // Используем polling для получения обновлений (для разработки)
        await this.bot.launch();
        this.logger.log('Telegram бот успешно запущен (polling режим)');
      } else {
        this.logger.log('Telegram бот настроен на использование webhook');
      }

      // Graceful stop
      process.once('SIGINT', () => this.bot?.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot?.stop('SIGTERM'));
    } catch (error) {
      this.logger.error('Ошибка при запуске Telegram бота:', error);
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

      if (!userId) {
        await ctx.reply('Не удалось получить данные пользователя.');
        return;
      }

      // Проверяем, зарегистрирован ли пользователь
      let isRegistered = false;
      try {
        await this.userService.loginTelegramUser(userId.toString());
        isRegistered = true;
      } catch {
        // Пользователь не зарегистрирован - это нормально
        isRegistered = false;
      }

      const message = isRegistered
        ? `👋 Привет, ${username}!\n\n` +
          `Вы уже зарегистрированы в системе. Нажмите кнопку ниже, чтобы открыть платформу.`
        : `👋 Привет, ${username}!\n\n` +
          `Добро пожаловать в Ani-Light!\n\n` +
          `Нажмите кнопку ниже, чтобы зарегистрироваться и открыть платформу.`;

      // Создаем кнопку для авторизации
      const authUrl = this.generateAuthUrl(userId.toString());

      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: isRegistered
                  ? '🚀 Открыть платформу'
                  : '🚀 Зарегистрироваться',
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

      if (!userId) {
        await ctx.answerCbQuery('Не удалось получить данные пользователя.');
        return;
      }

      const authUrl = this.generateAuthUrl(userId.toString());

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
   * Генерация URL для авторизации через WebApp
   * @param telegramId - Telegram ID пользователя
   */
  private generateAuthUrl(telegramId: string): string {
    // Создаем URL для WebApp
    // Фронтенд должен:
    // 1. Получить initData из window.Telegram.WebApp.initData
    // 2. Отправить его на /auth/telegram с initData или telegram_id
    const params = new URLSearchParams({
      telegram_id: telegramId,
      source: 'bot',
      auto_auth: 'true', // Флаг для автоматической авторизации
    });

    return `${this.frontendUrl}/auth/telegram?${params.toString()}`;
  }

  /**
   * Генерация временного токена для быстрой авторизации
   * Можно использовать для одноразовой авторизации через ссылку
   */
  async generateAuthToken(telegramId: string): Promise<string> {
    try {
      // Пытаемся найти пользователя
      const authResult = await this.userService.loginTelegramUser(telegramId);

      // Возвращаем JWT токен
      return authResult.access_token;
    } catch {
      // Если пользователь не зарегистрирован, возвращаем null
      // Фронтенд должен будет зарегистрировать пользователя
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
