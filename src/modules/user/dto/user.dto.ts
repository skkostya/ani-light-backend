import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    description:
      'InitData из Telegram Mini App для верификации (если передано, используется для верификации вместо прямых данных)',
    example:
      'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
  })
  @IsOptional()
  @IsString()
  initData?: string;

  @ApiPropertyOptional({
    description:
      'Telegram ID пользователя (обязателен, если initData не передан или верификация не удалась)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  telegram_id?: string;

  @ApiPropertyOptional({
    description:
      'Имя пользователя в Telegram (обязательно, если initData не передан или верификация не удалась)',
    example: 'username',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'Имя пользователя должно содержать минимум 3 символа',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Имя пользователя',
    example: 'Иван',
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Фамилия пользователя',
    example: 'Иванов',
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
    format: 'uri',
  })
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
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: 'uuid-user-id',
    format: 'uuid',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Email адрес пользователя',
    example: 'user@example.com',
    format: 'email',
  })
  email?: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'username',
  })
  username: string;

  @ApiProperty({
    description: 'Тип подписки',
    example: 'FREE',
    enum: ['FREE', 'PREMIUM', 'VIP'],
  })
  subscription_type: SubscriptionType;

  @ApiPropertyOptional({
    description: 'Дата истечения подписки',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  subscription_expires_at?: Date;

  @ApiProperty({
    description: 'Активна ли подписка',
    example: true,
  })
  hasActiveSubscription: boolean;

  @ApiProperty({
    description: 'Скрывать ли рекламу',
    example: false,
  })
  shouldHideAds: boolean;

  @ApiProperty({
    description: 'Тип аутентификации',
    example: 'EMAIL',
    enum: ['EMAIL', 'TELEGRAM'],
  })
  auth_type: AuthType;

  @ApiPropertyOptional({
    description: 'Telegram ID пользователя',
    example: '123456789',
  })
  telegram_id?: string;

  @ApiProperty({
    description: 'Дата создания аккаунта',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
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
