import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { EpisodeWatchStatus } from '../entities/user-episode.entity';

export class CreateUserEpisodeDto {
  @ApiProperty({
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @IsUUID()
  episode_id: string;

  @ApiPropertyOptional({
    description: 'Статус просмотра эпизода',
    example: 'not_watched',
    enum: ['not_watched', 'watching', 'watched'],
  })
  @IsOptional()
  @IsEnum(EpisodeWatchStatus)
  status?: EpisodeWatchStatus;

  @ApiPropertyOptional({
    description: 'Оценка эпизода от 1 до 10',
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

export class UpdateUserEpisodeDto {
  @ApiPropertyOptional({
    description: 'Статус просмотра эпизода',
    example: 'watched',
    enum: ['not_watched', 'watching', 'watched'],
  })
  @IsOptional()
  @IsEnum(EpisodeWatchStatus)
  status?: EpisodeWatchStatus;

  @ApiPropertyOptional({
    description: 'Оценка эпизода от 1 до 10',
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

export class MarkEpisodeWatchedDto {
  @ApiPropertyOptional({
    description: 'Просмотрен ли эпизод до конца',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  watched_until_end?: boolean;
}

export class UserEpisodeResponseDto {
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
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  episode_id: string;

  @ApiProperty({
    description: 'Статус просмотра эпизода',
    example: 'watched',
    enum: ['not_watched', 'watching', 'watched'],
  })
  status: EpisodeWatchStatus;

  @ApiPropertyOptional({
    description: 'Дата последнего просмотра',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  last_watched_at?: Date;

  @ApiPropertyOptional({
    description: 'Дата просмотра до конца',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  watched_until_end_at?: Date;

  @ApiPropertyOptional({
    description: 'Оценка эпизода от 1 до 10',
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
