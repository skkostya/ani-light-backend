import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class CreateEpisodeRatingDto {
  @ApiProperty({
    description: 'ID эпизода для оценки',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @IsUUID()
  episode_id: string;

  @ApiProperty({
    description: 'Оценка эпизода от 1 до 10',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating: number;
}

export class UpdateEpisodeRatingDto {
  @ApiProperty({
    description: 'Новая оценка эпизода от 1 до 10',
    example: 9,
    minimum: 1,
    maximum: 10,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating: number;
}

export class EpisodeRatingResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор оценки',
    example: 'uuid-rating-id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID пользователя, поставившего оценку',
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
    description: 'Оценка от 1 до 10',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  rating: number;

  @ApiProperty({
    description: 'Дата создания оценки',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Дата последнего обновления оценки',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  updated_at: Date;
}
