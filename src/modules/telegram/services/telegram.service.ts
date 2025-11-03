import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramInitData, TelegramUser } from '../dto/telegram.dto';
import { verifyTelegramWebAppData } from '../utils/telegram-verification.util';

@Injectable()
export class TelegramService {
  constructor(private configService: ConfigService) {}

  /**
   * Верифицирует initData из Telegram Mini App
   * @param initData - строка initData от Telegram
   * @returns верифицированные данные пользователя
   * @throws UnauthorizedException если данные неверны или подпись не совпадает
   */
  verifyInitData(initData: string): TelegramInitData {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      throw new UnauthorizedException(
        'Telegram Bot Token не настроен на сервере',
      );
    }

    try {
      const verified = verifyTelegramWebAppData(initData, botToken);
      return verified;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Ошибка верификации данных Telegram: ' + error.message,
      );
    }
  }

  /**
   * Парсит и декодирует initData из Telegram Mini App без верификации подписи
   * @param initData - строка initData от Telegram
   * @returns распарсенные данные
   */
  parseInitData(initData: string): TelegramInitData {
    return verifyTelegramWebAppData(initData, '', false);
  }

  /**
   * Извлекает данные пользователя из верифицированных данных Telegram
   * @param initData - верифицированные данные
   * @returns данные пользователя
   */
  getUserFromInitData(initData: TelegramInitData): TelegramUser | null {
    return initData.user || null;
  }
}
