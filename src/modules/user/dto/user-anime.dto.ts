import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateUserAnimeDto {
  @ApiProperty({
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @IsUUID()
  anime_id: string;

  @ApiPropertyOptional({
    description: 'Добавить в избранное',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @ApiPropertyOptional({
    description: 'Добавить в "Хочу посмотреть"',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  want_to_watch?: boolean;

  @ApiPropertyOptional({
    description: 'Включить уведомления в Telegram',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifications_telegram?: boolean;

  @ApiPropertyOptional({
    description: 'Включить уведомления по email',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  notifications_email?: boolean;

  @ApiPropertyOptional({
    description: 'Оценка аниме от 1 до 10',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating?: number;
}

export class UpdateUserAnimeDto {
  @ApiPropertyOptional({
    description: 'Добавить в избранное',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @ApiPropertyOptional({
    description: 'Добавить в "Хочу посмотреть"',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  want_to_watch?: boolean;

  @ApiPropertyOptional({
    description: 'Включить уведомления в Telegram',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifications_telegram?: boolean;

  @ApiPropertyOptional({
    description: 'Включить уведомления по email',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  notifications_email?: boolean;

  @ApiPropertyOptional({
    description: 'Оценка аниме от 1 до 10',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating?: number;
}

export class UserAnimeResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор записи',
    example: 'uuid-record-id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID пользователя',
    example: 'uuid-user-id',
    format: 'uuid',
  })
  user_id: string;

  @ApiProperty({
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  anime_id: string;

  @ApiProperty({
    description: 'В избранном',
    example: true,
  })
  is_favorite: boolean;

  @ApiProperty({
    description: 'В списке "Хочу посмотреть"',
    example: false,
  })
  want_to_watch: boolean;

  @ApiProperty({
    description: 'Уведомления в Telegram включены',
    example: true,
  })
  notifications_telegram: boolean;

  @ApiProperty({
    description: 'Уведомления по email включены',
    example: false,
  })
  notifications_email: boolean;

  @ApiPropertyOptional({
    description: 'Оценка аниме от 1 до 10',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  rating?: number;

  @ApiProperty({
    description: 'Дата создания записи',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Дата последнего обновления записи',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  updated_at: Date;
}
