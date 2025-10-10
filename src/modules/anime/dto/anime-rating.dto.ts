import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class CreateAnimeRatingDto {
  @ApiProperty({
    description: 'ID аниме для оценки',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @IsUUID()
  anime_id: string;

  @ApiProperty({
    description: 'Оценка аниме от 1 до 10',
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

export class UpdateAnimeRatingDto {
  @ApiProperty({
    description: 'Новая оценка аниме от 1 до 10',
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

export class AnimeRatingResponseDto {
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
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  anime_id: string;

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
