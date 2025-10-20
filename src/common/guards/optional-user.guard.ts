import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from '../../modules/user/dto/user.dto';
import { UserService } from '../../modules/user/user.service';

/**
 * Guard для извлечения авторизованного пользователя из cookie без обязательной проверки авторизации
 *
 * Использование:
 * @Get()
 * @UseGuards(OptionalUserGuard)
 * async getData(@Request() req: any) {
 *   // req.user будет содержать данные пользователя, если он авторизован
 *   // или null, если не авторизован
 * }
 */
@Injectable()
export class OptionalUserGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Извлекаем токен из запроса
      let token: string | null = null;

      // Сначала пробуем извлечь из заголовка Authorization
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      // Если в заголовке нет, пробуем извлечь из cookies
      else if (request.cookies && request.cookies['access_token']) {
        token = request.cookies['access_token'];
      }

      console.log('---------------------------------------');
      console.log('OptionalUserGuard - request.cookies', request.cookies);
      console.log('OptionalUserGuard - token', token);
      console.log('---------------------------------------');

      if (!token) {
        request.user = null;
        return true; // Всегда разрешаем доступ
      }

      try {
        // Валидируем токен
        const payload: JwtPayloadDto = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_SECRET'),
        });

        if (!payload) {
          request.user = null;
          return true;
        }

        // Получаем пользователя из базы данных
        const user = await this.userService.validateUser(payload);
        request.user = user;

        console.log('OptionalUserGuard - user found:', user?.username);
      } catch (error) {
        console.error(
          'OptionalUserGuard - token validation error:',
          error.message,
        );
        request.user = null;
      }
    } catch (error) {
      console.error('OptionalUserGuard - error:', error);
      request.user = null;
    }

    // Всегда разрешаем доступ (это опциональная аутентификация)
    return true;
  }
}
