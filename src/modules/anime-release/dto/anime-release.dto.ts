import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetAnimeListDto {
  @ApiPropertyOptional({
    description: 'Поисковый запрос по названию аниме',
    example: 'наруто',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по жанру',
    example: 'action',
    required: false,
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по году выпуска',
    example: 2023,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({
    description: 'Номер страницы для пагинации',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SearchDto {
  @ApiProperty({
    description: 'Поисковый запрос',
    example: 'наруто',
    minLength: 1,
  })
  @IsString()
  q: string;
}

export class CreateAnimeDto {
  @ApiPropertyOptional({
    description: 'Внешний ID из AniLibria API',
    example: 12345,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  external_id?: number;

  @ApiProperty({
    description: 'Название аниме на русском языке',
    example: 'Наруто',
    minLength: 1,
  })
  @IsString()
  title_ru: string;

  @ApiProperty({
    description: 'Название аниме на английском языке',
    example: 'Naruto',
    minLength: 1,
  })
  @IsString()
  title_en: string;

  @ApiProperty({
    description: 'Описание аниме',
    example: 'История о ниндзя по имени Наруто Узумаки...',
    minLength: 1,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Год выпуска аниме',
    example: 2002,
    minimum: 1900,
    maximum: 2030,
  })
  @IsNumber()
  year: number;

  @ApiProperty({
    description: 'URL постера аниме',
    example: 'https://example.com/poster.jpg',
    format: 'uri',
  })
  @IsString()
  poster_url: string;

  @ApiPropertyOptional({
    description: 'Псевдоним аниме',
    example: 'naruto',
    required: false,
  })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({
    description: 'Заблокировано ли аниме по геолокации',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_blocked_by_geo?: boolean;

  @ApiPropertyOptional({
    description: 'Является ли аниме продолжающимся',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_ongoing?: boolean;

  @ApiPropertyOptional({
    description: 'День недели выхода новых серий',
    example: { value: 1, description: 'Понедельник' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  publish_day?: {
    value: number;
    description: string;
  };

  @ApiPropertyOptional({
    description: 'Общее количество эпизодов',
    example: 720,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  episodes_total?: number;

  @ApiPropertyOptional({
    description: 'Средняя продолжительность эпизода в минутах',
    example: 24,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  average_duration_of_episode?: number;

  @ApiPropertyOptional({
    description: 'Дата создания в внешней системе (ISO 8601)',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  external_created_at?: string;

  @ApiPropertyOptional({
    description: 'ID возрастного рейтинга',
    example: 'uuid-age-rating-id',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  age_rating_id?: string;

  @ApiPropertyOptional({
    description: 'Список ID жанров',
    example: ['uuid-genre-1', 'uuid-genre-2'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  genre_ids?: string[];
}

export class UpdateAnimeDto {
  @ApiPropertyOptional({
    description: 'Название аниме на русском языке',
    example: 'Наруто',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  title_ru?: string;

  @ApiPropertyOptional({
    description: 'Название аниме на английском языке',
    example: 'Naruto',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  title_en?: string;

  @ApiPropertyOptional({
    description: 'Описание аниме',
    example: 'История о ниндзя по имени Наруто Узумаки...',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Год выпуска аниме',
    example: 2002,
    minimum: 1900,
    maximum: 2030,
  })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({
    description: 'URL постера аниме',
    example: 'https://example.com/poster.jpg',
    format: 'uri',
  })
  @IsOptional()
  @IsString()
  poster_url?: string;

  @ApiPropertyOptional({
    description: 'Псевдоним аниме',
    example: 'naruto',
  })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({
    description: 'Заблокировано ли аниме по геолокации',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_blocked_by_geo?: boolean;

  @ApiPropertyOptional({
    description: 'Является ли аниме продолжающимся',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_ongoing?: boolean;

  @ApiPropertyOptional({
    description: 'День недели выхода новых серий',
    example: { value: 1, description: 'Понедельник' },
  })
  @IsOptional()
  @IsObject()
  publish_day?: {
    value: number;
    description: string;
  };

  @ApiPropertyOptional({
    description: 'Общее количество эпизодов',
    example: 720,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  episodes_total?: number;

  @ApiPropertyOptional({
    description: 'Средняя продолжительность эпизода в минутах',
    example: 24,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  average_duration_of_episode?: number;

  @ApiPropertyOptional({
    description: 'Дата создания в внешней системе (ISO 8601)',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  external_created_at?: string;

  @ApiPropertyOptional({
    description: 'ID возрастного рейтинга',
    example: 'uuid-age-rating-id',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  age_rating_id?: string;

  @ApiPropertyOptional({
    description: 'Список ID жанров',
    example: ['uuid-genre-1', 'uuid-genre-2'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  genre_ids?: string[];
}
