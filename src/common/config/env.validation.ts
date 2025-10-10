import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // База данных
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),

  // API
  ANILIBRIA_API_URL: Joi.string().uri().required(),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

  // Приложение
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),

  // Telegram (опционально)
  TELEGRAM_BOT_TOKEN: Joi.string().optional(),

  // Дополнительные настройки (опционально)
  CORS_ORIGIN: Joi.string().optional(),
  RATE_LIMIT_TTL: Joi.number().optional(),
  RATE_LIMIT_MAX: Joi.number().optional(),
});
