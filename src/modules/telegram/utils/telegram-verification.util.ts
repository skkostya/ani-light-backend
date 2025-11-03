import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  TelegramChat,
  TelegramInitData,
  TelegramUser,
} from '../dto/telegram.dto';

/**
 * Верифицирует данные из Telegram Mini App
 * @param initData - строка initData от Telegram WebApp
 * @param botToken - токен бота для вычисления секретного ключа
 * @param verifySignature - нужно ли проверять подпись (по умолчанию true)
 * @returns верифицированные данные
 * @throws UnauthorizedException если данные неверны или подпись не совпадает
 */
export function verifyTelegramWebAppData(
  initData: string,
  botToken: string,
  verifySignature: boolean = true,
): TelegramInitData {
  if (!initData || !initData.trim()) {
    throw new UnauthorizedException('initData не может быть пустым');
  }

  // Парсим query string
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');

  if (!hash && verifySignature) {
    throw new UnauthorizedException('Отсутствует hash в initData');
  }

  // Если нужно проверить подпись
  if (verifySignature && botToken && hash) {
    // Вычисляем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Извлекаем все параметры кроме hash
    const dataCheckString: string[] = [];
    urlParams.forEach((value, key) => {
      if (key !== 'hash') {
        dataCheckString.push(`${key}=${value}`);
      }
    });

    // Сортируем параметры по ключу
    dataCheckString.sort();

    // Вычисляем HMAC-SHA256 подпись
    const dataCheckStr = dataCheckString.join('\n');
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckStr)
      .digest('hex');

    // Сравниваем подписи
    if (calculatedHash !== hash) {
      throw new UnauthorizedException('Неверная подпись initData');
    }
  }

  // Проверяем время жизни данных (auth_date)
  const authDateStr = urlParams.get('auth_date');
  if (authDateStr && verifySignature) {
    const authDate = parseInt(authDateStr, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - authDate;

    // Данные действительны в течение 24 часов
    if (timeDiff > 86400) {
      throw new UnauthorizedException(
        'Данные initData истекли (старше 24 часов)',
      );
    }

    // Проверяем, что данные не из будущего (с небольшим запасом)
    if (timeDiff < -300) {
      throw new UnauthorizedException('Неверное время в initData');
    }
  }

  // Парсим данные пользователя
  const userStr = urlParams.get('user');
  let user: TelegramUser | undefined;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      throw new UnauthorizedException(
        'Ошибка парсинга данных пользователя: ' + error.message,
      );
    }
  }

  // Парсим данные чата (если есть)
  const chatStr = urlParams.get('chat');
  let chat: TelegramChat | undefined;

  if (chatStr) {
    try {
      chat = JSON.parse(chatStr);
    } catch (error) {
      console.error('Ошибка парсинга данных чата: ' + error.message);
      // Чат не обязателен, поэтому не бросаем ошибку
    }
  }

  return {
    query_id: urlParams.get('query_id') || undefined,
    user,
    receiver: urlParams.get('receiver')
      ? JSON.parse(urlParams.get('receiver')!)
      : undefined,
    chat,
    chat_type: urlParams.get('chat_type') || undefined,
    chat_instance: urlParams.get('chat_instance') || undefined,
    start_param: urlParams.get('start_param') || undefined,
    can_send_after: urlParams.get('can_send_after')
      ? parseInt(urlParams.get('can_send_after')!, 10)
      : undefined,
    auth_date: authDateStr ? parseInt(authDateStr, 10) : 0,
    hash: hash || '',
  };
}
