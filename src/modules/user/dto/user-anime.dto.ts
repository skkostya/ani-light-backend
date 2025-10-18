import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dto/pagination.dto';

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

export class GetUserAnimeListDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    minimum: 1,
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
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

export class PaginatedUserAnimeResponseDto extends PaginatedResponseDto<UserAnimeResponseDto> {
  @ApiProperty({
    description: 'Список связей пользователя с аниме',
    type: [UserAnimeResponseDto],
  })
  declare data: UserAnimeResponseDto[];

  @ApiProperty({
    description: 'Информация о пагинации',
    example: {
      total: 100,
      page: 1,
      limit: 20,
      totalPages: 5,
    },
  })
  declare pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty({
    description: 'Есть ли следующая страница',
    example: true,
  })
  declare hasNext: boolean;

  @ApiProperty({
    description: 'Есть ли предыдущая страница',
    example: false,
  })
  declare hasPrev: boolean;
}

// Расширенный DTO для ответов с дополнительными связями
export class UserAnimeWithRelationsResponseDto extends UserAnimeResponseDto {
  @ApiProperty({
    description:
      'Информация об аниме с дополнительными связями (релизы и жанры)',
    example: {
      id: 'uuid-anime-id',
      name: 'Атака титанов',
      name_english: 'Attack on Titan',
      animeReleases: [
        {
          id: 'uuid-release-id',
          title_ru: 'Атака титанов',
          title_en: 'Attack on Titan',
          animeGenres: [
            {
              genre: {
                id: 'uuid-genre-id',
                name: 'Драма',
                external_id: 1,
                image: {
                  optimized_preview: 'https://example.com/preview.jpg',
                  preview: 'https://example.com/full.jpg',
                },
              },
            },
          ],
        },
      ],
    },
  })
  anime: any; // Используем any для упрощения, так как структура сложная и уже определена в сущностях
}

export class PaginatedUserAnimeWithRelationsResponseDto extends PaginatedResponseDto<UserAnimeWithRelationsResponseDto> {
  @ApiProperty({
    description:
      'Список связей пользователя с аниме (с дополнительными связями: релизы аниме и жанры)',
    type: [UserAnimeWithRelationsResponseDto],
  })
  declare data: UserAnimeWithRelationsResponseDto[];

  @ApiProperty({
    description: 'Информация о пагинации',
    example: {
      total: 100,
      page: 1,
      limit: 20,
      totalPages: 5,
    },
  })
  declare pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty({
    description: 'Есть ли следующая страница',
    example: true,
  })
  declare hasNext: boolean;

  @ApiProperty({
    description: 'Есть ли предыдущая страница',
    example: false,
  })
  declare hasPrev: boolean;
}
