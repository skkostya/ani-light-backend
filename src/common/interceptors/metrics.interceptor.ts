import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,

    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,

    @InjectMetric('active_connections')
    private readonly activeConnections: Gauge<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const route = request.route?.path || request.url;
    const startTime = Date.now();

    // Увеличиваем счетчик активных соединений
    this.activeConnections.inc();

    // Создаем таймер для измерения длительности запроса
    const timer = this.httpRequestDuration.startTimer({
      method,
      route,
    });

    return next.handle().pipe(
      tap(() => {
        // Успешный запрос
        const statusCode = response.statusCode;

        // Увеличиваем счетчик запросов
        this.httpRequestsTotal.inc({
          method,
          route,
          status_code: statusCode.toString(),
          status: 'success',
        });

        // Завершаем таймер
        timer({ status_code: statusCode.toString() });

        // Уменьшаем счетчик активных соединений
        this.activeConnections.dec();
      }),
      catchError((error) => {
        // Ошибка в запросе
        const statusCode = error.status || 500;

        // Увеличиваем счетчик запросов с ошибкой
        this.httpRequestsTotal.inc({
          method,
          route,
          status_code: statusCode.toString(),
          status: 'error',
        });

        // Завершаем таймер
        timer({ status_code: statusCode.toString() });

        // Уменьшаем счетчик активных соединений
        this.activeConnections.dec();

        return throwError(() => error);
      }),
    );
  }
}
