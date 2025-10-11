import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Специальная обработка для ошибок авторизации
      if (exception instanceof UnauthorizedException) {
        // Если это уже структурированная ошибка авторизации, используем её как есть
        if (
          typeof exceptionResponse === 'object' &&
          exceptionResponse !== null
        ) {
          message = exceptionResponse;
        } else {
          // Если это простая строка, оборачиваем в стандартную структуру
          message = {
            error: 'Unauthorized',
            message:
              typeof exceptionResponse === 'string'
                ? exceptionResponse
                : 'Unauthorized',
            statusCode: 401,
            timestamp: new Date().toISOString(),
          };
        }
      } else {
        // Для других HTTP исключений используем стандартную обработку
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = {
        error: 'Internal Server Error',
        message: 'Internal server error',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };

      // Логируем неожиданные ошибки
      this.logger.error(
        `Unexpected error: ${String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Если message уже является объектом с полной структурой ошибки, используем его
    if (
      typeof message === 'object' &&
      message !== null &&
      'statusCode' in message
    ) {
      // Добавляем дополнительную информацию о запросе
      const errorResponse = {
        ...message,
        path: request.url,
        method: request.method,
      };

      // Логируем HTTP ошибки только в режиме разработки
      if (process.env.NODE_ENV === 'development' && status >= 400) {
        this.logger.warn(
          `HTTP ${status} Error: ${request.method} ${request.url}`,
          JSON.stringify(errorResponse, null, 2),
        );
      }

      response.status(status).json(errorResponse);
    } else {
      // Стандартная обработка для простых сообщений
      const errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
      };

      // Логируем HTTP ошибки только в режиме разработки
      if (process.env.NODE_ENV === 'development' && status >= 400) {
        this.logger.warn(
          `HTTP ${status} Error: ${request.method} ${request.url}`,
          JSON.stringify(errorResponse, null, 2),
        );
      }

      response.status(status).json(errorResponse);
    }
  }
}
