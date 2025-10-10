import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { register } from 'prom-client';

@ApiTags('metrics')
@Controller('metrics')
@SkipThrottle() // Исключаем метрики из rate limiting
export class MetricsController {
  @Get()
  @ApiOperation({
    summary: 'Получить метрики Prometheus',
    description: 'Возвращает метрики в формате Prometheus для мониторинга',
  })
  @ApiResponse({
    status: 200,
    description: 'Метрики успешно получены',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/anime",status_code="200",status="success"} 150

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/anime",status_code="200",le="0.1"} 50
http_request_duration_seconds_bucket{method="GET",route="/api/anime",status_code="200",le="0.5"} 100
http_request_duration_seconds_bucket{method="GET",route="/api/anime",status_code="200",le="1"} 140
http_request_duration_seconds_bucket{method="GET",route="/api/anime",status_code="200",le="2"} 150
http_request_duration_seconds_bucket{method="GET",route="/api/anime",status_code="200",le="5"} 150
http_request_duration_seconds_bucket{method="GET",route="/api/anime",status_code="200",le="10"} 150
http_request_duration_seconds_bucket{method="GET",route="/api/anime",status_code="200",le="+Inf"} 150
http_request_duration_seconds_sum{method="GET",route="/api/anime",status_code="200"} 75.5
http_request_duration_seconds_count{method="GET",route="/api/anime",status_code="200"} 150

# HELP active_connections Number of active connections
# TYPE active_connections gauge
active_connections 5

# HELP users_by_subscription_type Number of users by subscription type
# TYPE users_by_subscription_type gauge
users_by_subscription_type{subscription_type="free"} 1000
users_by_subscription_type{subscription_type="premium"} 150

# HELP external_api_requests_total Total number of external API requests
# TYPE external_api_requests_total counter
external_api_requests_total{api_name="anilibria",status="success"} 500
external_api_requests_total{api_name="anilibria",status="error"} 10

# HELP cache_operations_total Total number of cache operations
# TYPE cache_operations_total counter
cache_operations_total{operation="get",result="hit"} 800
cache_operations_total{operation="get",result="miss"} 200
cache_operations_total{operation="set",result="success"} 200`,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка при получении метрик',
  })
  async getMetrics() {
    return register.metrics();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Проверка здоровья метрик',
    description: 'Проверяет, что система метрик работает корректно',
  })
  @ApiResponse({
    status: 200,
    description: 'Система метрик работает нормально',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        metrics: {
          type: 'object',
          properties: {
            total_metrics: { type: 'number', example: 5 },
            last_updated: {
              type: 'string',
              example: '2023-01-01T00:00:00.000Z',
              format: 'date-time',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Система метрик недоступна',
  })
  async getMetricsHealth() {
    const metrics = await register.getMetricsAsJSON();

    return {
      status: 'ok',
      metrics: {
        total_metrics: metrics.length,
        last_updated: new Date().toISOString(),
      },
    };
  }
}
