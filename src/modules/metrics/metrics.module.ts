import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { MetricsInterceptor } from '../../common/interceptors/metrics.interceptor';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [PrometheusModule],
  controllers: [MetricsController],
  providers: [
    // Счетчик HTTP запросов
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'status'],
    }),

    // Гистограмма времени выполнения запросов
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счетчик активных соединений
    makeGaugeProvider({
      name: 'active_connections',
      help: 'Number of active connections',
    }),

    // Счетчик пользователей по типу подписки
    makeGaugeProvider({
      name: 'users_by_subscription_type',
      help: 'Number of users by subscription type',
      labelNames: ['subscription_type'],
    }),

    // Счетчик запросов к внешним API
    makeCounterProvider({
      name: 'external_api_requests_total',
      help: 'Total number of external API requests',
      labelNames: ['api_name', 'status'],
    }),

    // Счетчик кэш-попаданий
    makeCounterProvider({
      name: 'cache_operations_total',
      help: 'Total number of cache operations',
      labelNames: ['operation', 'result'], // operation: get/set, result: hit/miss
    }),

    MetricsInterceptor,
  ],
  exports: [MetricsInterceptor],
})
export class MetricsModule {}
