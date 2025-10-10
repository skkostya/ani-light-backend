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
      'API для аниме стриминг платформы с аутентификацией, кэшированием и интеграцией с AniLibria',
    )
    .setVersion('1.0.0')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('anime', 'Управление аниме контентом')
    .addTag('episodes', 'Управление эпизодами')
    .addTag('users', 'Управление пользователями')
    .addTag('health', 'Мониторинг и health checks')
    .addTag('metrics', 'Метрики Prometheus')
    .addTag('dictionaries', 'Справочники (жанры, возрастные рейтинги)')
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Ani-Light API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
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
