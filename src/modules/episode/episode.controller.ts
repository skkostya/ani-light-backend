import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UuidParamDto } from '../../common/dto/uuid-param.dto';
import { GetEpisodesDto } from './dto/episode.dto';
import { EpisodeService } from './episode.service';

@ApiTags('episodes')
@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список эпизодов',
    description: 'Возвращает список всех эпизодов для указанного аниме',
  })
  @ApiQuery({
    name: 'animeId',
    description: 'ID аниме для получения эпизодов',
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
  async getEpisodes(@Query() query: GetEpisodesDto) {
    return this.episodeService.getEpisodes(query.animeId);
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
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден',
  })
  async getEpisodeDetails(@Param() params: UuidParamDto) {
    return this.episodeService.getEpisodeDetails(params.id);
  }
}
