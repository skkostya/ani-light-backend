import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Парсинг cookies
  app.use(cookieParser());

  // Сжатие ответов
  app.use(
    compression({
      filter: (req, res) => {
        // Не сжимаем уже сжатые файлы
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Используем стандартный фильтр compression
        return compression.filter(req, res);
      },
      level: 6, // Уровень сжатия (1-9, где 9 - максимальное сжатие)
      threshold: 1024, // Минимальный размер для сжатия (1KB)
    }),
  );

  // Безопасность заголовков
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Отключаем для совместимости с CORS
    }),
  );

  // Глобальная обработка ошибок
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, которых нет в DTO
      forbidNonWhitelisted: true, // Выбрасывает ошибку при лишних свойствах
      transform: true, // Автоматически преобразует типы
      transformOptions: {
        enableImplicitConversion: true, // Преобразует строки в числа автоматически
      },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // URL фронтенда
    credentials: true, // ВАЖНО: разрешаем cookies
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  }); // CORS для фронта с поддержкой cookies

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Ani-Light Backend API')
    .setDescription(
      `# Ani-Light Backend API

Полнофункциональная API для аниме стриминг платформы с поддержкой:

## 🎯 Основные возможности
- **Аутентификация**: JWT токены + HTTP-only cookies
- **Аниме контент**: Полная интеграция с AniLibria API
- **Пользовательские списки**: Избранное, хочу посмотреть, рейтинги
- **Комментарии и реакции**: Система обсуждений эпизодов
- **Мониторинг**: Health checks и метрики Prometheus
- **Справочники**: Жанры и возрастные рейтинги

## 🔐 Аутентификация
API поддерживает два способа аутентификации:
1. **Bearer Token** - JWT токен в заголовке Authorization
2. **Cookie** - JWT токен в httpOnly cookie access_token

## 📊 Мониторинг
- \`/health\` - общие health checks
- \`/health/ready\` - готовность к работе
- \`/health/live\` - проверка живости
- \`/metrics\` - метрики Prometheus

## 🚀 Быстрый старт
1. Зарегистрируйтесь через Telegram: \`POST /auth/telegram\`
2. Получите список аниме: \`GET /anime\`
3. Добавьте в избранное: \`POST /user/anime\`
4. Оцените эпизод: \`POST /episodes/{id}/ratings\`

## 📝 Примечания
- Все эндпоинты требуют аутентификации, кроме health checks
- Rate limiting применяется к большинству эндпоинтов
- Поддерживается пагинация для списков
- Валидация данных на уровне DTO`,
    )
    .setVersion('1.0.0')
    .setContact(
      'Ani-Light Team',
      'https://github.com/ani-light',
      'support@ani-light.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Development server')
    .addServer('https://api.ani-light.com', 'Production server')
    .addTag('auth', 'Аутентификация и авторизация пользователей')
    .addTag('anime', 'Управление аниме контентом и рейтингами')
    .addTag('episodes', 'Управление эпизодами, комментариями и рейтингами')
    .addTag('users', 'Управление пользователями и их списками')
    .addTag('health', 'Мониторинг состояния системы')
    .addTag('metrics', 'Метрики Prometheus для мониторинга')
    .addTag('dictionaries', 'Справочники жанров и возрастных рейтингов')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'JWT токен в httpOnly cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none', // Сворачиваем все секции по умолчанию
      filter: true, // Включаем поиск
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // Добавляем CORS заголовки для тестирования
        req.headers['Access-Control-Allow-Origin'] = '*';
        return req;
      },
    },
    customSiteTitle: 'Ani-Light API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .swagger-ui .opblock.opblock-post { border-color: #10b981; }
      .swagger-ui .opblock.opblock-get { border-color: #3b82f6; }
      .swagger-ui .opblock.opblock-put { border-color: #f59e0b; }
      .swagger-ui .opblock.opblock-delete { border-color: #ef4444; }
      .swagger-ui .opblock.opblock-patch { border-color: #8b5cf6; }
    `,
  });

  await app.listen(process.env.PORT ?? 3001);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    (async () => {
      await app.close();
      process.exit(0);
    })().catch((error) => {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    (async () => {
      await app.close();
      process.exit(0);
    })().catch((error) => {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    });
  });

  // Обработка необработанных исключений
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}
void bootstrap();
