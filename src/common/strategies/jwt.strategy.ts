import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../../modules/user/dto/user.dto';
import { UserService } from '../../modules/user/user.service';
import {
  AUTH_ERROR_DETAILS,
  AUTH_ERROR_MESSAGES,
  AuthErrorType,
} from '../enums/auth-error.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: (req: Request) => JwtStrategy.extractJwtFromRequest(req),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Извлекает JWT токен из заголовков Authorization или из cookies
   */
  private static extractJwtFromRequest(req: Request): string | null {
    // Сначала пробуем извлечь из заголовка Authorization
    const fromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (fromHeader) {
      return fromHeader;
    }

    // Если в заголовке нет, пробуем извлечь из cookies
    if (req.cookies && req.cookies['access_token']) {
      return req.cookies['access_token'];
    }

    // Если нигде нет токена, возвращаем null
    return null;
  }

  async validate(payload: JwtPayloadDto) {
    // Проверяем, существует ли пользователь
    const user = await this.userService.validateUser(payload);

    if (!user) {
      const errorType = AuthErrorType.USER_NOT_FOUND;
      const message = AUTH_ERROR_MESSAGES[errorType];
      const details = AUTH_ERROR_DETAILS[errorType];

      throw new UnauthorizedException({
        error: 'Unauthorized',
        message,
        details,
        errorType,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    if (!user.is_active) {
      const errorType = AuthErrorType.USER_INACTIVE;
      const message = AUTH_ERROR_MESSAGES[errorType];
      const details = AUTH_ERROR_DETAILS[errorType];

      throw new UnauthorizedException({
        error: 'Unauthorized',
        message,
        details,
        errorType,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    // Возвращаем пользователя с актуальной информацией о подписке
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      subscription_type: user.subscription_type,
      subscription_expires_at: user.subscription_expires_at,
      hasActiveSubscription: user.hasActiveSubscription,
      shouldHideAds: user.shouldHideAds,
      auth_type: user.auth_type,
      telegram_id: user.telegram_id,
    };
  }
}
