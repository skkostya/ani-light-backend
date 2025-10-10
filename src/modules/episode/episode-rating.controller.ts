import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateEpisodeRatingDto,
  EpisodeRatingResponseDto,
  UpdateEpisodeRatingDto,
} from './dto/episode-rating.dto';
import { EpisodeRatingService } from './episode-rating.service';

@ApiTags('episodes')
@Controller('episodes/:episodeId/ratings')
export class EpisodeRatingController {
  constructor(private readonly ratingService: EpisodeRatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Создать оценку эпизода',
    description: 'Создает новую оценку эпизода для текущего пользователя',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода для оценки',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiBody({
    type: CreateEpisodeRatingDto,
    description: 'Данные для создания оценки',
  })
  @ApiResponse({
    status: 201,
    description: 'Оценка успешно создана',
    type: EpisodeRatingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 409,
    description: 'Оценка уже существует для данного эпизода',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  create(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() createDto: CreateEpisodeRatingDto,
  ) {
    return this.ratingService.create(req.user.id, {
      ...createDto,
      episode_id: episodeId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все оценки эпизода',
    description: 'Возвращает список всех оценок для указанного эпизода',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Список оценок успешно получен',
    type: [EpisodeRatingResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден',
  })
  findAll(@Param('episodeId') episodeId: string) {
    return this.ratingService.findByEpisode(episodeId);
  }

  @Get('average')
  @ApiOperation({
    summary: 'Получить среднюю оценку эпизода',
    description: 'Возвращает среднюю оценку и количество оценок для эпизода',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Средняя оценка успешно получена',
    schema: {
      type: 'object',
      properties: {
        average: { type: 'number', example: 8.5 },
        count: { type: 'number', example: 150 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден',
  })
  getAverage(@Param('episodeId') episodeId: string) {
    return this.ratingService.getAverageRating(episodeId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получить мою оценку эпизода',
    description:
      'Возвращает оценку текущего пользователя для указанного эпизода',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Оценка пользователя успешно получена',
    type: EpisodeRatingResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Оценка не найдена',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  findMy(@Request() req, @Param('episodeId') episodeId: string) {
    return this.ratingService.findOne(req.user.id, episodeId);
  }

  @Patch('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Обновить мою оценку эпизода',
    description:
      'Обновляет оценку текущего пользователя для указанного эпизода',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateEpisodeRatingDto,
    description: 'Новые данные оценки',
  })
  @ApiResponse({
    status: 200,
    description: 'Оценка успешно обновлена',
    type: EpisodeRatingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Оценка не найдена',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  updateMy(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() updateDto: UpdateEpisodeRatingDto,
  ) {
    return this.ratingService.update(req.user.id, episodeId, updateDto);
  }

  @Delete('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Удалить мою оценку эпизода',
    description: 'Удаляет оценку текущего пользователя для указанного эпизода',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Оценка успешно удалена',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Оценка не найдена',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  removeMy(@Request() req, @Param('episodeId') episodeId: string) {
    return this.ratingService.remove(req.user.id, episodeId);
  }
}
