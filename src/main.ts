import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
