import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AuthType, SubscriptionType } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email: string;

  @IsString()
  @MinLength(3, {
    message: 'Имя пользователя должно содержать минимум 3 символа',
  })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}

export class CreateTelegramUserDto {
  @IsString()
  telegram_id: string;

  @IsString()
  @MinLength(3, {
    message: 'Имя пользователя должно содержать минимум 3 символа',
  })
  username: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email: string;

  @IsString()
  password: string;
}

export class UserResponseDto {
  id: string;
  email?: string;
  username: string;
  subscription_type: SubscriptionType;
  subscription_expires_at?: Date;
  hasActiveSubscription: boolean;
  shouldHideAds: boolean;
  auth_type: AuthType;
  telegram_id?: string;
  created_at: Date;
}

export class JwtPayloadDto {
  sub: string; // user id
  email?: string;
  username: string;
  subscription_type: SubscriptionType;
  subscription_expires_at?: Date;
  auth_type: AuthType;
  telegram_id?: string;
  iat?: number;
  exp?: number;
}
