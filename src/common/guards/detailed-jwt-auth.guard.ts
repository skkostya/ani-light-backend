import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  AUTH_ERROR_DETAILS,
  AUTH_ERROR_MESSAGES,
  AuthErrorType,
} from '../enums/auth-error.enum';

/**
 * Детальный JWT Auth Guard с расширенной информацией об ошибках
 * Используется для API endpoints, где нужна подробная информация об ошибках авторизации
 */
@Injectable()
export class DetailedJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // Если есть ошибка или нет пользователя
    if (err || !user) {
      let errorType: AuthErrorType;
      let suggestions: string[] = [];

      // Определяем тип ошибки на основе информации от Passport
      if (err) {
        // Ошибка валидации токена
        if (err.name === 'TokenExpiredError') {
          errorType = AuthErrorType.TOKEN_EXPIRED;
          suggestions = [
            'Войдите в систему заново',
            'Проверьте настройки времени на вашем устройстве',
            'Обратитесь к администратору, если проблема повторяется',
          ];
        } else if (err.name === 'JsonWebTokenError') {
          errorType = AuthErrorType.TOKEN_INVALID;
          suggestions = [
            'Войдите в систему заново',
            'Очистите cookies браузера',
            'Проверьте, что вы используете правильный аккаунт',
          ];
        } else if (err.name === 'NotBeforeError') {
          errorType = AuthErrorType.TOKEN_INVALID;
          suggestions = [
            'Войдите в систему заново',
            'Проверьте настройки времени на вашем устройстве',
          ];
        } else {
          errorType = AuthErrorType.TOKEN_INVALID;
          suggestions = ['Войдите в систему заново'];
        }
      } else if (info) {
        // Информация от Passport стратегии
        if (info.name === 'TokenExpiredError') {
          errorType = AuthErrorType.TOKEN_EXPIRED;
          suggestions = [
            'Войдите в систему заново',
            'Проверьте настройки времени на вашем устройстве',
          ];
        } else if (info.name === 'JsonWebTokenError') {
          errorType = AuthErrorType.TOKEN_INVALID;
          suggestions = [
            'Войдите в систему заново',
            'Очистите cookies браузера',
          ];
        } else if (info.message === 'No auth token') {
          errorType = AuthErrorType.TOKEN_MISSING;
          suggestions = [
            'Войдите в систему',
            'Проверьте, что вы авторизованы',
            'Обновите страницу',
          ];
        } else {
          errorType = AuthErrorType.TOKEN_INVALID;
          suggestions = ['Войдите в систему заново'];
        }
      } else {
        // Пользователь не найден (обычно из-за недействительного токена)
        errorType = AuthErrorType.TOKEN_INVALID;
        suggestions = ['Войдите в систему заново'];
      }

      const message = AUTH_ERROR_MESSAGES[errorType];
      const details = AUTH_ERROR_DETAILS[errorType];

      // Создаем детальную ошибку авторизации с дополнительными предложениями
      const error = new UnauthorizedException({
        error: 'Unauthorized',
        message,
        details,
        errorType,
        suggestions,
        statusCode: 401,
        timestamp: new Date().toISOString(),
        // Дополнительная информация для разработчиков
        debug:
          process.env.NODE_ENV === 'development'
            ? {
                originalError: err?.name || info?.name,
                originalMessage: err?.message || info?.message,
              }
            : undefined,
      });

      throw error;
    }

    // Если пользователь найден, возвращаем его
    return user;
  }
}
