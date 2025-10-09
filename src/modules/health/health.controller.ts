import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
@SkipThrottle() // Исключаем health checks из rate limiting
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Проверка базы данных
      () => this.db.pingCheck('database'),

      // Проверка памяти (не более 150MB heap)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // Проверка RSS памяти (не более 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Проверка свободного места на диске (минимум 250MB)
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9, // 90% заполненности
        }),
    ]);
  }

  @Get('external')
  @HealthCheck()
  checkExternal() {
    const anilibriaUrl = this.configService.get('ANILIBRIA_API_URL');

    return this.health.check([
      // Проверка доступности AniLibria API
      () =>
        this.http.pingCheck('anilibria_api', `${anilibriaUrl}/titles`, {
          timeout: 5000,
        }),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      // Проверка готовности базы данных
      () => this.db.pingCheck('database'),

      // Проверка критических ресурсов
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
    ]);
  }

  @Get('live')
  @HealthCheck()
  checkLiveness() {
    // Простая проверка живости - всегда возвращает OK
    // если приложение может обработать запрос
    return this.health.check([]);
  }
}
