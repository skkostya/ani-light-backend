import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Опциональный JWT Guard - не блокирует запросы, если токен отсутствует или невалидный
 * Просто добавляет информацию о пользователе в request, если токен валидный
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    // Всегда разрешаем доступ
    return true;
  }

  handleRequest(err: any, user: any) {
    // Если есть ошибка или нет пользователя, просто возвращаем null
    // Это не блокирует запрос, а просто означает, что пользователь не аутентифицирован
    if (err || !user) {
      return null;
    }

    // Если пользователь найден, возвращаем его
    return user;
  }
}
