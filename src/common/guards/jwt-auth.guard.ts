import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  AUTH_ERROR_DETAILS,
  AUTH_ERROR_MESSAGES,
  AuthErrorType,
} from '../enums/auth-error.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // Если есть ошибка или нет пользователя
    if (err || !user) {
      let errorType: AuthErrorType;

      // Определяем тип ошибки на основе информации от Passport
      if (err) {
        // Ошибка валидации токена
        if (err.name === 'TokenExpiredError') {
          errorType = AuthErrorType.TOKEN_EXPIRED;
        } else if (err.name === 'JsonWebTokenError') {
          errorType = AuthErrorType.TOKEN_INVALID;
        } else if (err.name === 'NotBeforeError') {
          errorType = AuthErrorType.TOKEN_INVALID;
        } else {
          errorType = AuthErrorType.TOKEN_INVALID;
        }
      } else if (info) {
        // Информация от Passport стратегии
        if (info.name === 'TokenExpiredError') {
          errorType = AuthErrorType.TOKEN_EXPIRED;
        } else if (info.name === 'JsonWebTokenError') {
          errorType = AuthErrorType.TOKEN_INVALID;
        } else if (info.message === 'No auth token') {
          errorType = AuthErrorType.TOKEN_MISSING;
        } else {
          errorType = AuthErrorType.TOKEN_INVALID;
        }
      } else {
        // Пользователь не найден (обычно из-за недействительного токена)
        errorType = AuthErrorType.TOKEN_INVALID;
      }

      const message = AUTH_ERROR_MESSAGES[errorType];
      const details = AUTH_ERROR_DETAILS[errorType];

      // Создаем детальную ошибку авторизации
      const error = new UnauthorizedException({
        error: 'Unauthorized',
        message,
        details,
        errorType,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }

    // Если пользователь найден, возвращаем его
    return user;
  }
}
