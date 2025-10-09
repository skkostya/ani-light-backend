import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Кастомный формат для консоли
const consoleFormat = printf(
  ({ level, message, timestamp, context, trace, ...meta }) => {
    const contextStr = typeof context === 'string' ? context : 'Application';
    let log = `${String(timestamp)} [${contextStr}] ${String(level)}: ${String(message)}`;

    // Добавляем метаданные если есть
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    // Добавляем stack trace для ошибок
    if (trace && typeof trace === 'string') {
      log += `\n${trace}`;
    }

    return log;
  },
);

export const winstonConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json(),
  ),
  defaultMeta: {
    service: 'ani-light-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Консольный вывод
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat,
      ),
    }),

    // Файл для всех логов
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), json()),
    }),

    // Отдельный файл для ошибок
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), json()),
    }),
  ],

  // Обработка неперехваченных исключений
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: combine(timestamp(), json()),
    }),
  ],

  // Обработка неперехваченных промисов
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: combine(timestamp(), json()),
    }),
  ],
};

// Для продакшена убираем консольный вывод и добавляем более строгие настройки
if (process.env.NODE_ENV === 'production') {
  winstonConfig.transports = [
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), json()),
    }),
  ];

  // В продакшене логируем только warning и выше
  winstonConfig.level = 'warn';
}
