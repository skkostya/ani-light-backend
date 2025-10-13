import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UuidParamDto } from '../../common/dto/uuid-param.dto';
import { AnimeService } from './anime.service';
import {
  CreateAnimeDto,
  GetAnimeListDto,
  UpdateAnimeDto,
} from './dto/anime.dto';

@ApiTags('anime')
@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Post()
  @ApiOperation({
    summary: 'Создать новое аниме',
    description: 'Создает новую запись аниме в базе данных',
  })
  @ApiBody({ type: CreateAnimeDto })
  @ApiResponse({
    status: 201,
    description: 'Аниме успешно создано',
    schema: {
      example: {
        id: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
        name: 'Re: Жизнь в другом мире с нуля',
        name_english: 'Re: Zero kara Hajimeru Isekai Seikatsu',
        image: '',
        rating: 8.45,
        last_year: 2023,
        first_year: 2010,
        total_releases: 10,
        total_episodes: 25,
        total_duration: '2 дня 5 часов',
        total_duration_in_seconds: 183600,
      },
    },
  })
  async create(@Body() createAnimeDto: CreateAnimeDto) {
    return await this.animeService.create(createAnimeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список аниме',
    description: 'Возвращает список аниме с пагинацией и фильтрацией',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поисковый запрос по названию',
    example: 'Re: Zero',
  })
  @ApiQuery({
    name: 'min_rating',
    required: false,
    description: 'Минимальный рейтинг',
    example: 8.0,
  })
  @ApiQuery({
    name: 'max_rating',
    required: false,
    description: 'Максимальный рейтинг',
    example: 9.0,
  })
  @ApiQuery({
    name: 'year_from',
    required: false,
    description: 'Год выпуска от',
    example: 2020,
  })
  @ApiQuery({
    name: 'year_to',
    required: false,
    description: 'Год выпуска до',
    example: 2023,
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    description: 'Фильтр по жанру',
    example: 'action',
  })
  @ApiQuery({
    name: 'is_ongoing',
    required: false,
    description: 'Фильтр по статусу "в процессе"',
    example: true,
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
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Список аниме успешно получен',
    schema: {
      example: {
        data: [
          {
            id: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
            name: 'Re: Жизнь в другом мире с нуля',
            name_english: 'Re: Zero kara Hajimeru Isekai Seikatsu',
            image: '',
            rating: 8.45,
            last_year: 2023,
            first_year: 2010,
            total_releases: 10,
            total_episodes: 25,
            total_duration: '2 дня 5 часов',
            total_duration_in_seconds: 183600,
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
        hasNext: false,
        hasPrev: false,
      },
    },
  })
  async findAll(@Query() query: GetAnimeListDto) {
    return await this.animeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить аниме по ID',
    description: 'Возвращает информацию об аниме по его идентификатору',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID аниме',
    example: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
  })
  @ApiResponse({
    status: 200,
    description: 'Аниме найдено',
    schema: {
      example: {
        id: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
        name: 'Re: Жизнь в другом мире с нуля',
        name_english: 'Re: Zero kara Hajimeru Isekai Seikatsu',
        image: '',
        rating: 8.45,
        last_year: 2023,
        first_year: 2010,
        total_releases: 10,
        total_episodes: 25,
        total_duration: '2 дня 5 часов',
        total_duration_in_seconds: 183600,
        animeReleases: [],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  async findOne(@Param() params: UuidParamDto) {
    return await this.animeService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить аниме',
    description: 'Обновляет информацию об аниме',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID аниме',
    example: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
  })
  @ApiBody({ type: UpdateAnimeDto })
  @ApiResponse({
    status: 200,
    description: 'Аниме успешно обновлено',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  async update(
    @Param() params: UuidParamDto,
    @Body() updateAnimeDto: UpdateAnimeDto,
  ) {
    return await this.animeService.update(params.id, updateAnimeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить аниме',
    description: 'Удаляет аниме из базы данных',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID аниме',
    example: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
  })
  @ApiResponse({
    status: 200,
    description: 'Аниме успешно удалено',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  async remove(@Param() params: UuidParamDto) {
    await this.animeService.remove(params.id);
    return { message: 'Аниме успешно удалено' };
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Получить статистику аниме',
    description:
      'Возвращает статистику по аниме (количество релизов, эпизодов, общая продолжительность)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID аниме',
    example: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика аниме получена',
    schema: {
      example: {
        total_releases: 10,
        total_episodes: 25,
        total_duration_in_seconds: 183600,
        average_rating: 8.45,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  async getStats(@Param() params: UuidParamDto) {
    return await this.animeService.getAnimeStats(params.id);
  }

  @Get('genre/:genreName')
  @ApiOperation({
    summary: 'Получить аниме по жанру',
    description: 'Возвращает список аниме определенного жанра с пагинацией',
  })
  @ApiParam({
    name: 'genreName',
    description: 'Название жанра',
    example: 'action',
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
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Список аниме по жанру получен',
  })
  async getByGenre(
    @Param('genreName') genreName: string,
    @Query() query: GetAnimeListDto,
  ) {
    return await this.animeService.getAnimeByGenre(genreName, query);
  }

  @Get('ongoing')
  @ApiOperation({
    summary: 'Получить продолжающиеся аниме',
    description: 'Возвращает список аниме со статусом "в процессе"',
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
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Список продолжающихся аниме получен',
  })
  async getOngoing(@Query() query: GetAnimeListDto) {
    return await this.animeService.getOngoingAnime(query);
  }

  @Get('stats/genres')
  @ApiOperation({
    summary: 'Получить статистику по жанрам',
    description: 'Возвращает количество аниме по каждому жанру',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика по жанрам получена',
    schema: {
      example: [
        { genre: 'action', count: 150 },
        { genre: 'romance', count: 120 },
        { genre: 'comedy', count: 100 },
      ],
    },
  })
  async getGenreStats() {
    return await this.animeService.getGenreStats();
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Синхронизировать аниме с внешним API',
    description: 'Загружает и синхронизирует данные аниме с внешнего API',
  })
  @ApiResponse({
    status: 200,
    description: 'Синхронизация завершена',
    schema: {
      example: {
        total: 100,
        created: 50,
        updated: 30,
        errors: 20,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка при синхронизации',
  })
  async syncFromApi() {
    return await this.animeService.syncAllAnimeFromApi();
  }

  @Get(':id/releases')
  @ApiOperation({
    summary: 'Получить релизы аниме',
    description:
      'Возвращает все релизы аниме с эпизодами, жанрами, возрастными ограничениями и рейтингом',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID аниме',
    example: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
  })
  @ApiResponse({
    status: 200,
    description: 'Релизы аниме получены',
    schema: {
      example: {
        id: '116e17d2-e89f-4ffc-bfa4-b45ae4c41e92',
        name: 'Re: Жизнь в другом мире с нуля',
        name_english: 'Re: Zero kara Hajimeru Isekai Seikatsu',
        animeReleases: [
          {
            id: 'release-uuid-1',
            title_ru: 'Re: Жизнь в другом мире с нуля',
            title_en: 'Re: Zero kara Hajimeru Isekai Seikatsu',
            description: 'Описание релиза',
            year: 2016,
            poster_url: 'https://example.com/poster.jpg',
            alias: 're-zero',
            is_ongoing: false,
            episodes_total: 25,
            average_duration_of_episode: 1440,
            ageRating: {
              id: 'age-rating-uuid',
              value: '16+',
              label: '16+',
              is_adult: false,
              description: 'Для зрителей старше 16 лет',
            },
            animeGenres: [
              {
                id: 'anime-genre-uuid-1',
                genre: {
                  id: 'genre-uuid-1',
                  name: 'action',
                  name_ru: 'Экшен',
                },
              },
              {
                id: 'anime-genre-uuid-2',
                genre: {
                  id: 'genre-uuid-2',
                  name: 'drama',
                  name_ru: 'Драма',
                },
              },
            ],
            episodes: [
              {
                id: 'episode-uuid-1',
                title: 'Эпизод 1',
                episode_number: 1,
                duration: 1440,
                description: 'Описание эпизода',
                video_url: 'https://example.com/video1.mp4',
                preview_url: 'https://example.com/preview1.jpg',
              },
            ],
            ratings: [
              {
                id: 'rating-uuid-1',
                user_id: 'user-uuid-1',
                anime_id: 'anime-uuid',
                rating: 9.5,
                created_at: '2024-01-01T00:00:00.000Z',
                updated_at: '2024-01-01T00:00:00.000Z',
              },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  async getAnimeReleases(@Param() params: UuidParamDto) {
    return await this.animeService.getAnimeReleases(params.id);
  }
}
