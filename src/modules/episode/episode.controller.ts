import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UuidParamDto } from '../../common/dto/uuid-param.dto';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { GetEpisodeByNumberDto, GetEpisodesDto } from './dto/episode.dto';
import { EpisodeService } from './episode.service';

@ApiTags('episodes')
@Controller('episodes')
@UseGuards(OptionalJwtGuard) // Применяем опциональную аутентификацию ко всем эндпоинтам
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список эпизодов',
    description: 'Возвращает список всех эпизодов для указанного аниме',
  })
  @ApiQuery({
    name: 'animeId',
    description: 'ID сезона аниме для получения эпизодов',
    example: 'uuid-anime-id',
    format: 'uuid',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Список эпизодов успешно получен',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          anime_id: { type: 'string', example: 'uuid' },
          number: { type: 'number', example: 1 },
          video_url: {
            type: 'string',
            example: 'https://example.com/video.mp4',
          },
          subtitles_url: {
            type: 'string',
            example: 'https://example.com/subtitles.vtt',
          },
          video_url_480: {
            type: 'string',
            example: 'https://example.com/video_480.mp4',
          },
          video_url_720: {
            type: 'string',
            example: 'https://example.com/video_720.mp4',
          },
          video_url_1080: {
            type: 'string',
            example: 'https://example.com/video_1080.mp4',
          },
          opening: {
            type: 'object',
            properties: {
              start: { type: 'number', example: 90 },
              stop: { type: 'number', example: 120 },
            },
          },
          ending: {
            type: 'object',
            properties: {
              start: { type: 'number', example: 1320 },
              stop: { type: 'number', example: 1440 },
            },
          },
          duration: { type: 'number', example: 1440 },
          preview_image: {
            type: 'string',
            example: 'https://example.com/preview.jpg',
          },
          anime: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              title_ru: { type: 'string', example: 'Наруто' },
              title_en: { type: 'string', example: 'Naruto' },
              poster_url: {
                type: 'string',
                example: 'https://example.com/poster.jpg',
              },
            },
          },
          userEpisodes: {
            type: 'array',
            description:
              'Связь пользователя с эпизодом (только для авторизованных пользователей)',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                user_id: { type: 'string', example: 'uuid' },
                episode_id: { type: 'string', example: 'uuid' },
                status: {
                  type: 'string',
                  enum: ['not_watched', 'watching', 'watched'],
                  example: 'watching',
                },
                last_watched_at: {
                  type: 'string',
                  example: '2023-01-01T00:00:00.000Z',
                  nullable: true,
                },
                watched_until_end_at: {
                  type: 'string',
                  example: '2023-01-01T00:00:00.000Z',
                  nullable: true,
                },
                rating: { type: 'number', example: 8, nullable: true },
                created_at: {
                  type: 'string',
                  example: '2023-01-01T00:00:00.000Z',
                },
                updated_at: {
                  type: 'string',
                  example: '2023-01-01T00:00:00.000Z',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные параметры запроса',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  async getEpisodes(@Query() query: GetEpisodesDto, @Request() req: any) {
    return this.episodeService.getEpisodes(
      query.animeId,
      req.user?.id as string,
    );
  }

  @Get('by-number')
  @ApiOperation({
    summary: 'Получить эпизод по номеру серии и anime_id',
    description: 'Возвращает эпизод по номеру серии для указанного аниме',
  })
  @ApiQuery({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
    required: true,
  })
  @ApiQuery({
    name: 'number',
    description: 'Номер эпизода',
    example: 1,
    type: 'number',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Эпизод успешно найден',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        anime_id: { type: 'string', example: 'uuid' },
        number: { type: 'number', example: 1 },
        video_url: { type: 'string', example: 'https://example.com/video.mp4' },
        subtitles_url: {
          type: 'string',
          example: 'https://example.com/subtitles.vtt',
        },
        video_url_480: {
          type: 'string',
          example: 'https://example.com/video_480.mp4',
        },
        video_url_720: {
          type: 'string',
          example: 'https://example.com/video_720.mp4',
        },
        video_url_1080: {
          type: 'string',
          example: 'https://example.com/video_1080.mp4',
        },
        opening: {
          type: 'object',
          properties: {
            start: { type: 'number', example: 90 },
            stop: { type: 'number', example: 120 },
          },
        },
        ending: {
          type: 'object',
          properties: {
            start: { type: 'number', example: 1320 },
            stop: { type: 'number', example: 1440 },
          },
        },
        duration: { type: 'number', example: 1440 },
        preview_image: {
          type: 'string',
          example: 'https://example.com/preview.jpg',
        },
        anime: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            title_ru: { type: 'string', example: 'Наруто' },
            title_en: { type: 'string', example: 'Naruto' },
            poster_url: {
              type: 'string',
              example: 'https://example.com/poster.jpg',
            },
          },
        },
        userEpisodes: {
          type: 'array',
          description:
            'Связь пользователя с эпизодом (только для авторизованных пользователей)',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              user_id: { type: 'string', example: 'uuid' },
              episode_id: { type: 'string', example: 'uuid' },
              status: {
                type: 'string',
                enum: ['not_watched', 'watching', 'watched'],
                example: 'watching',
              },
              last_watched_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
                nullable: true,
              },
              watched_until_end_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
                nullable: true,
              },
              rating: { type: 'number', example: 8, nullable: true },
              created_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
              },
              updated_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден',
  })
  async getEpisodeByNumber(
    @Query() query: GetEpisodeByNumberDto,
    @Request() req: any,
  ) {
    return this.episodeService.getEpisodeByNumber(
      query.alias,
      query.seasonNumber,
      query.number,
      req.user?.id as string,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить детали эпизода',
    description: 'Возвращает подробную информацию об эпизоде по его ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Детали эпизода успешно получены',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        anime_id: { type: 'string', example: 'uuid' },
        number: { type: 'number', example: 1 },
        video_url: { type: 'string', example: 'https://example.com/video.mp4' },
        subtitles_url: {
          type: 'string',
          example: 'https://example.com/subtitles.vtt',
        },
        video_url_480: {
          type: 'string',
          example: 'https://example.com/video_480.mp4',
        },
        video_url_720: {
          type: 'string',
          example: 'https://example.com/video_720.mp4',
        },
        video_url_1080: {
          type: 'string',
          example: 'https://example.com/video_1080.mp4',
        },
        opening: {
          type: 'object',
          properties: {
            start: { type: 'number', example: 90 },
            stop: { type: 'number', example: 120 },
          },
        },
        ending: {
          type: 'object',
          properties: {
            start: { type: 'number', example: 1320 },
            stop: { type: 'number', example: 1440 },
          },
        },
        duration: { type: 'number', example: 1440 },
        preview_image: {
          type: 'string',
          example: 'https://example.com/preview.jpg',
        },
        anime: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            title_ru: { type: 'string', example: 'Наруто' },
            title_en: { type: 'string', example: 'Naruto' },
            poster_url: {
              type: 'string',
              example: 'https://example.com/poster.jpg',
            },
          },
        },
        userEpisodes: {
          type: 'array',
          description:
            'Связь пользователя с эпизодом (только для авторизованных пользователей)',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              user_id: { type: 'string', example: 'uuid' },
              episode_id: { type: 'string', example: 'uuid' },
              status: {
                type: 'string',
                enum: ['not_watched', 'watching', 'watched'],
                example: 'watching',
              },
              last_watched_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
                nullable: true,
              },
              watched_until_end_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
                nullable: true,
              },
              rating: { type: 'number', example: 8, nullable: true },
              created_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
              },
              updated_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден',
  })
  async getEpisodeDetails(@Param() params: UuidParamDto, @Request() req: any) {
    return this.episodeService.getEpisodeDetails(
      params.id,
      req.user?.id as string,
    );
  }
}
