import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UuidParamDto } from '../../common/dto/uuid-param.dto';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { AnimeService } from './anime.service';
import { GetAnimeListDto, SearchDto } from './dto/anime.dto';

@ApiTags('anime')
@Controller('anime')
@UseGuards(OptionalJwtGuard) // Применяем опциональную аутентификацию ко всем эндпоинтам
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

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
              title_ru: { type: 'string', example: 'Наруто' },
              title_en: { type: 'string', example: 'Naruto' },
              description: { type: 'string', example: 'Описание аниме' },
              year: { type: 'number', example: 2002 },
              poster_url: {
                type: 'string',
                example: 'https://example.com/poster.jpg',
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
    const result = await this.animeService.getAnimeList(query);

    // Добавляем информацию о том, нужно ли показывать рекламу
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
  async searchAnime(@Query() query: SearchDto, @Request() req: any) {
    const result = await this.animeService.searchAnime(query.q);

    return {
      results: result,
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
  async getAnimeDetails(@Param() params: UuidParamDto, @Request() req: any) {
    const result = await this.animeService.getAnimeDetails(params.id);

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
  async getEpisodes(@Param() params: UuidParamDto, @Request() req: any) {
    const result = await this.animeService.getEpisodes(params.id);

    return {
      episodes: result,
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
