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
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';
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

export class UserEpisodeWithAnimeInfoResponseDto extends UserEpisodeResponseDto {
  @ApiProperty({
    description: 'Информация об эпизоде с дополнительными полями',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'ID эпизода',
        example: 'episode-uuid',
      },
      anime_release_id: {
        type: 'string',
        format: 'uuid',
        description: 'ID релиза аниме',
        example: 'anime-release-uuid',
      },
      anime_id: {
        type: 'string',
        format: 'uuid',
        description: 'ID аниме',
        example: 'anime-uuid',
        nullable: true,
      },
      number: {
        type: 'number',
        description: 'Номер эпизода',
        example: 1,
      },
      video_url: {
        type: 'string',
        description: 'URL видео',
        example: 'https://example.com/video.mp4',
      },
    },
  })
  episode: {
    id: string;
    anime_release_id: string;
    anime_id: string | null;
    number: number;
    video_url: string;
    subtitles_url?: string;
    video_url_480?: string;
    video_url_720?: string;
    video_url_1080?: string;
    opening?: {
      start: number;
      stop: number;
    };
    ending?: {
      start: number;
      stop: number;
    };
    duration?: number;
    preview_image?: string;
  };
}

export class UserEpisodeHistoryResponseDto extends UserEpisodeResponseDto {
  @ApiProperty({
    description: 'Информация об эпизоде',
    type: 'object',
    additionalProperties: true,
  })
  episode: {
    id: string;
    anime_release_id: string;
    number: number;
    video_url: string;
    subtitles_url?: string;
    video_url_480?: string;
    video_url_720?: string;
    video_url_1080?: string;
    opening?: {
      start: number;
      stop: number;
    };
    ending?: {
      start: number;
      stop: number;
    };
    duration?: number;
    preview_image?: string;
  };

  @ApiProperty({
    description: 'Информация о релизе аниме',
    type: 'object',
    additionalProperties: true,
  })
  animeRelease: {
    id: string;
    anime_id: string;
    title: string;
    type: string;
    anime: {
      id: string;
      alias: string;
    };
  };
}

export class PaginatedUserEpisodeHistoryResponseDto extends PaginatedResponseDto<UserEpisodeHistoryResponseDto> {
  @ApiProperty({
    description: 'Список эпизодов из истории просмотра',
    type: [UserEpisodeHistoryResponseDto],
  })
  declare data: UserEpisodeHistoryResponseDto[];

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
