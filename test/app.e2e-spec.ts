import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { AppModule } from './../src/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Применяем те же настройки, что и в main.ts
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Root endpoint', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Health checks', () => {
    it('/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('info');
        });
    });

    it('/health/live (GET) should return liveness status', () => {
      return request(app.getHttpServer()).get('/health/live').expect(200);
    });
  });

  describe('Anime API', () => {
    it('/anime (GET) should return paginated anime list', () => {
      return request(app.getHttpServer())
        .get('/anime')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('shouldHideAds');
          expect(res.body.shouldHideAds).toBe(false); // Без токена реклама показывается
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/anime (GET) should apply pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/anime?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
        });
    });

    it('/anime (GET) should validate pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/anime?page=0&limit=101') // Невалидные параметры
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('/anime/search (GET) should return search results', () => {
      return request(app.getHttpServer())
        .get('/anime/search?q=test')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('shouldHideAds');
          expect(res.body.shouldHideAds).toBe(false);
        });
    });

    it('/anime/search (GET) should validate search query', () => {
      return request(app.getHttpServer())
        .get('/anime/search') // Отсутствует обязательный параметр q
        .expect(400);
    });

    it('/anime/:id (GET) should validate UUID parameter', () => {
      return request(app.getHttpServer())
        .get('/anime/invalid-uuid')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body.message).toContain('UUID');
        });
    });
  });

  describe('Authentication API', () => {
    const testUser = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };

    it('/auth/register (POST) should validate input data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          username: 'ab', // Слишком короткое
          password: '123', // Слишком короткий
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });

    it('/auth/login (POST) should validate input data', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          // password отсутствует
        })
        .expect(400);
    });

    it('/auth/profile (GET) should return unauthenticated status without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('authenticated', false);
          expect(res.body).toHaveProperty('shouldHideAds', false);
          expect(res.body).toHaveProperty('user', null);
        });
    });

    it('/auth/logout (POST) should clear auth cookie', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Выход выполнен успешно');
          // Проверяем, что cookie очищается
          const cookies = res.headers['set-cookie'];
          if (cookies) {
            const authCookie = cookies.find((cookie: string) =>
              cookie.startsWith('access_token='),
            );
            if (authCookie) {
              expect(authCookie).toContain('access_token=;');
            }
          }
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to search endpoint', async () => {
      // Делаем несколько быстрых запросов к поиску
      const promises = Array(5)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/anime/search?q=test'));

      const responses = await Promise.all(promises);

      // Некоторые запросы должны быть заблокированы rate limiter
      const tooManyRequests = responses.some((res) => res.status === 429);
      expect(tooManyRequests).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', () => {
      return request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('path', '/non-existent-endpoint');
        });
    });
  });
});
