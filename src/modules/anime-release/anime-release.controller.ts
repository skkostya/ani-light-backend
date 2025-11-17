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
import { Throttle } from '@nestjs/throttler';
import { UuidParamDto } from '../../common/dto/uuid-param.dto';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { AnimeReleaseService } from './anime-release.service';
import { GetAnimeListDto, SearchDto } from './dto/anime-release.dto';

@ApiTags('anime-release')
@Controller('anime-release')
@UseGuards(OptionalJwtGuard) // Применяем опциональную аутентификацию ко всем эндпоинтам
export class AnimeReleaseController {
  constructor(private readonly animeReleaseService: AnimeReleaseService) {}

  @Get('sync')
  @ApiOperation({
    summary: 'Загрузить все доступные аниме в базу',
    description:
      'Циклично отправляет запросы в anilibria api за аниме раз в полминуты по 50 элементов',
  })
  async syncAllAnime() {
    await this.animeReleaseService.syncAllAnime();
  }

  @Get('sync-anime-links')
  @ApiOperation({
    summary: 'Синхронизировать связи anime-release с anime',
    description:
      'Находит все anime-release записи без связи с anime и связывает их с соответствующими anime записями на основе данных франшизы из API',
  })
  @ApiResponse({
    status: 200,
    description: 'Синхронизация завершена',
    schema: {
      type: 'object',
      properties: {
        processed: { type: 'number', example: 100 },
        linked: { type: 'number', example: 95 },
        created: { type: 'number', example: 10 },
        errors: { type: 'number', example: 5 },
      },
    },
  })
  async syncAnimeReleaseWithAnime() {
    return await this.animeReleaseService.syncAnimeReleaseWithAnime();
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список аниме',
    description: 'Возвращает список аниме с пагинацией и фильтрацией',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество элементов на странице',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поисковый запрос',
    example: 'наруто',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    description: 'Фильтр по жанру',
    example: 'action',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Фильтр по году',
    example: 2023,
  })
  @ApiResponse({
    status: 200,
    description: 'Список аниме успешно получен',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              external_id: { type: 'number', example: 12345 },
              title_ru: { type: 'string', example: 'Наруто' },
              title_en: { type: 'string', example: 'Naruto' },
              description: { type: 'string', example: 'Описание аниме' },
              year: { type: 'number', example: 2002 },
              poster_url: {
                type: 'string',
                example: 'https://example.com/poster.jpg',
              },
              alias: { type: 'string', example: 'naruto' },
              is_blocked_by_geo: { type: 'boolean', example: false },
              is_ongoing: { type: 'boolean', example: false },
              publish_day: {
                type: 'object',
                properties: {
                  value: { type: 'number', example: 1 },
                  description: { type: 'string', example: 'Понедельник' },
                },
              },
              episodes_total: { type: 'number', example: 720 },
              average_duration_of_episode: { type: 'number', example: 24 },
              external_created_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
                format: 'date-time',
              },
              age_rating: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid' },
                  value: { type: 'string', example: 'R12_PLUS' },
                  label: { type: 'string', example: '12+' },
                  description: {
                    type: 'string',
                    example: 'Для детей старше 12 лет',
                  },
                },
              },
              animeGenres: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'uuid' },
                    anime_id: { type: 'string', example: 'uuid' },
                    genre_id: { type: 'string', example: 'uuid' },
                    genre: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'uuid' },
                        external_id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Экшен' },
                        image: {
                          type: 'object',
                          properties: {
                            optimized_preview: {
                              type: 'string',
                              example: 'https://example.com/preview.jpg',
                            },
                            preview: {
                              type: 'string',
                              example: 'https://example.com/full.jpg',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              userAnime: {
                type: 'array',
                description:
                  'Связь пользователя с аниме (только для авторизованных пользователей)',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'uuid' },
                    user_id: { type: 'string', example: 'uuid' },
                    anime_id: { type: 'string', example: 'uuid' },
                    is_favorite: { type: 'boolean', example: false },
                    want_to_watch: { type: 'boolean', example: true },
                    notifications_telegram: { type: 'boolean', example: false },
                    notifications_email: { type: 'boolean', example: false },
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
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async getAnimeList(@Query() query: GetAnimeListDto, @Request() req: any) {
    const result = await this.animeReleaseService.getAnimeList(
      query,
      req.user?.id as string,
    );

    // Возвращаем данные в формате согласно документации API
    return {
      ...result,
      shouldHideAds: req.user?.shouldHideAds || false,
      user: req.user
        ? {
            id: req.user.id,
            username: req.user.username,
            subscription_type: req.user.subscription_type,
          }
        : null,
    };
  }

  @Get('search')
  @Throttle({ short: { limit: 2, ttl: 1000 } }) // Более строгий лимит для поиска
  @ApiOperation({
    summary: 'Поиск аниме',
    description:
      'Выполняет поиск аниме по названию с ограничением по частоте запросов',
  })
  @ApiQuery({
    name: 'q',
    description: 'Поисковый запрос',
    example: 'наруто',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Результаты поиска успешно получены',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              external_id: { type: 'number', example: 12345 },
              title_ru: { type: 'string', example: 'Наруто' },
              title_en: { type: 'string', example: 'Naruto' },
              description: { type: 'string', example: 'Описание аниме' },
              year: { type: 'number', example: 2002 },
              poster_url: {
                type: 'string',
                example: 'https://example.com/poster.jpg',
              },
              alias: { type: 'string', example: 'naruto' },
              is_blocked_by_geo: { type: 'boolean', example: false },
              is_ongoing: { type: 'boolean', example: false },
              publish_day: {
                type: 'object',
                properties: {
                  value: { type: 'number', example: 1 },
                  description: { type: 'string', example: 'Понедельник' },
                },
              },
              episodes_total: { type: 'number', example: 720 },
              average_duration_of_episode: { type: 'number', example: 24 },
              external_created_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
                format: 'date-time',
              },
              age_rating: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid' },
                  value: { type: 'string', example: 'R12_PLUS' },
                  label: { type: 'string', example: '12+' },
                  description: {
                    type: 'string',
                    example: 'Для детей старше 12 лет',
                  },
                },
              },
              animeGenres: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'uuid' },
                    anime_id: { type: 'string', example: 'uuid' },
                    genre_id: { type: 'string', example: 'uuid' },
                    genre: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'uuid' },
                        external_id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Экшен' },
                        image: {
                          type: 'object',
                          properties: {
                            optimized_preview: {
                              type: 'string',
                              example: 'https://example.com/preview.jpg',
                            },
                            preview: {
                              type: 'string',
                              example: 'https://example.com/full.jpg',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              userAnime: {
                type: 'array',
                description:
                  'Связь пользователя с аниме (только для авторизованных пользователей)',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'uuid' },
                    user_id: { type: 'string', example: 'uuid' },
                    anime_id: { type: 'string', example: 'uuid' },
                    is_favorite: { type: 'boolean', example: false },
                    want_to_watch: { type: 'boolean', example: true },
                    notifications_telegram: { type: 'boolean', example: false },
                    notifications_email: { type: 'boolean', example: false },
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
        shouldHideAds: { type: 'boolean', example: false },
        user: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string', example: 'uuid' },
            username: { type: 'string', example: 'username' },
            subscription_type: { type: 'string', example: 'premium' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Слишком много запросов. Превышен лимит rate limiting',
  })
  async searchAnime(@Query() query: SearchDto, @Request() req: any) {
    const result = (await this.animeReleaseService.searchAnime(
      query.q,
      req.user?.id as string,
    )) as { data: any[]; meta: any };

    return {
      data: result.data,
      shouldHideAds: req.user?.shouldHideAds || false,
      user: req.user
        ? {
            id: req.user.id,
            username: req.user.username,
            subscription_type: req.user.subscription_type,
          }
        : null,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить детали аниме',
    description: 'Возвращает подробную информацию об аниме по его ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Детали аниме успешно получены',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        external_id: { type: 'number', example: 12345 },
        title_ru: { type: 'string', example: 'Наруто' },
        title_en: { type: 'string', example: 'Naruto' },
        description: { type: 'string', example: 'Описание аниме' },
        year: { type: 'number', example: 2002 },
        poster_url: {
          type: 'string',
          example: 'https://example.com/poster.jpg',
        },
        alias: { type: 'string', example: 'naruto' },
        is_blocked_by_geo: { type: 'boolean', example: false },
        is_ongoing: { type: 'boolean', example: false },
        publish_day: {
          type: 'object',
          properties: {
            value: { type: 'number', example: 1 },
            description: { type: 'string', example: 'Понедельник' },
          },
        },
        episodes_total: { type: 'number', example: 720 },
        average_duration_of_episode: { type: 'number', example: 24 },
        external_created_at: {
          type: 'string',
          example: '2023-01-01T00:00:00.000Z',
          format: 'date-time',
        },
        age_rating: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            value: { type: 'string', example: 'R12_PLUS' },
            label: { type: 'string', example: '12+' },
            description: { type: 'string', example: 'Для детей старше 12 лет' },
          },
        },
        genres: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              external_id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Экшен' },
              image: {
                type: 'object',
                properties: {
                  optimized_preview: {
                    type: 'string',
                    example: 'https://example.com/preview.jpg',
                  },
                  preview: {
                    type: 'string',
                    example: 'https://example.com/full.jpg',
                  },
                },
              },
            },
          },
        },
        userAnime: {
          type: 'array',
          description:
            'Связь пользователя с аниме (только для авторизованных пользователей)',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              user_id: { type: 'string', example: 'uuid' },
              anime_id: { type: 'string', example: 'uuid' },
              is_favorite: { type: 'boolean', example: false },
              want_to_watch: { type: 'boolean', example: true },
              notifications_telegram: { type: 'boolean', example: false },
              notifications_email: { type: 'boolean', example: false },
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
        shouldHideAds: { type: 'boolean', example: false },
        user: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string', example: 'uuid' },
            username: { type: 'string', example: 'username' },
            subscription_type: { type: 'string', example: 'premium' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  async getAnimeDetails(@Param() params: UuidParamDto, @Request() req: any) {
    const result = await this.animeReleaseService.getAnimeDetails(
      params.id,
      req.user?.id as string,
    );

    return {
      ...result,
      shouldHideAds: req.user?.shouldHideAds || false,
      user: req.user
        ? {
            id: req.user.id,
            username: req.user.username,
            subscription_type: req.user.subscription_type,
          }
        : null,
    };
  }

  @Get(':id/episodes')
  @ApiOperation({
    summary: 'Получить эпизоды аниме',
    description: 'Возвращает список всех эпизодов для указанного аниме',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Список эпизодов успешно получен',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              anime_id: { type: 'string', example: 'uuid' },
              episode_number: { type: 'number', example: 1 },
              title: { type: 'string', example: 'Начало приключений' },
              description: { type: 'string', example: 'Описание эпизода' },
              duration: { type: 'number', example: 1440 },
              video_url: {
                type: 'string',
                example: 'https://example.com/video.mp4',
              },
              thumbnail_url: {
                type: 'string',
                example: 'https://example.com/thumb.jpg',
              },
              created_at: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z',
              },
            },
          },
        },
        shouldHideAds: { type: 'boolean', example: false },
        user: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string', example: 'uuid' },
            username: { type: 'string', example: 'username' },
            subscription_type: { type: 'string', example: 'premium' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  async getEpisodes(@Param() params: UuidParamDto, @Request() req: any) {
    const result = await this.animeReleaseService.getEpisodes(params.id);

    return {
      data: result,
      shouldHideAds: req.user?.shouldHideAds || false,
      user: req.user
        ? {
            id: req.user.id,
            username: req.user.username,
            subscription_type: req.user.subscription_type,
          }
        : null,
    };
  }
}
