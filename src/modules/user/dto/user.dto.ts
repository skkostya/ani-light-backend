import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../../common/validators/password-strength.validator';
import { AuthType, SubscriptionType } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email адрес пользователя',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'username',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, {
    message: 'Имя пользователя должно содержать минимум 3 символа',
  })
  username: string;

  @ApiProperty({
    description:
      'Пароль пользователя (минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword()
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
  @ApiProperty({
    description: 'Email адрес пользователя',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'password123',
  })
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
