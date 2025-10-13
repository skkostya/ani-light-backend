import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// DTO для внешнего API ответа
export class ExternalApiImageDto {
  @ApiProperty({
    description: 'URL превью изображения',
    example: '/...GoH5bzLFS7A21DzacgUApScj7qJY1iMz.(jpg|webp)',
  })
  preview: string;

  @ApiProperty({
    description: 'URL миниатюры изображения',
    example: '/.../GoH5bzLFS7A21DzacgUApScj7qJY1iMz.(jpg|webp)',
  })
  thumbnail: string;

  @ApiProperty({
    description: 'Оптимизированные изображения',
    type: 'object',
    properties: {
      preview: {
        type: 'string',
        description: 'URL превью изображения',
      },
      thumbnail: {
        type: 'string',
        description: 'URL миниатюры изображения',
      },
    },
  })
  optimized: {
    preview: string;
    thumbnail: string;
  };
}

export class ExternalApiAnimeDto {
  @ApiProperty({
    description: 'ID аниме из внешнего API',
    example: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
  })
  id: string;

  @ApiProperty({
    description: 'Название аниме на русском языке',
    example: 'Re: Жизнь в другом мире с нуля',
  })
  name: string;

  @ApiProperty({
    description: 'Название аниме на английском языке',
    example: 'Re: Zero kara Hajimeru Isekai Seikatsu',
  })
  name_english: string;

  @ApiProperty({
    description: 'Изображения аниме',
    type: ExternalApiImageDto,
  })
  image: ExternalApiImageDto;

  @ApiProperty({
    description: 'Рейтинг аниме',
    example: 8.45,
  })
  rating: number;

  @ApiProperty({
    description: 'Последний год выпуска',
    example: 2023,
  })
  last_year: number;

  @ApiProperty({
    description: 'Первый год выпуска',
    example: 2010,
  })
  first_year: number;

  @ApiProperty({
    description: 'Общее количество релизов',
    example: 10,
  })
  total_releases: number;

  @ApiProperty({
    description: 'Общее количество эпизодов',
    example: 25,
  })
  total_episodes: number;

  @ApiProperty({
    description: 'Общая продолжительность в читаемом формате',
    example: '2 дня 5 часов',
  })
  total_duration: string;

  @ApiProperty({
    description: 'Общая продолжительность в секундах',
    example: 183600,
  })
  total_duration_in_seconds: number;
}

export class GetAnimeListDto {
  @ApiPropertyOptional({
    description: 'Поисковый запрос по названию аниме',
    example: 'Re: Zero',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по рейтингу (минимальный)',
    example: 8.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  min_rating?: number;

  @ApiPropertyOptional({
    description: 'Фильтр по рейтингу (максимальный)',
    example: 9.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  max_rating?: number;

  @ApiPropertyOptional({
    description: 'Фильтр по году выпуска (от)',
    example: 2020,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year_from?: number;

  @ApiPropertyOptional({
    description: 'Фильтр по году выпуска (до)',
    example: 2023,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year_to?: number;

  @ApiPropertyOptional({
    description: 'Фильтр по жанру (название жанра)',
    example: 'action',
    required: false,
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по статусу "в процессе" (только продолжающиеся аниме)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_ongoing?: boolean;

  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
