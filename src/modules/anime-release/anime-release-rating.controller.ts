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
import { AnimeReleaseRatingService } from './anime-release-rating.service';
import {
  AnimeRatingResponseDto,
  CreateAnimeRatingDto,
  UpdateAnimeRatingDto,
} from './dto/anime-release-rating.dto';

@ApiTags('anime-release')
@Controller('anime-release/:animeId/ratings')
export class AnimeReleaseRatingController {
  constructor(
    private readonly animeReleaseRatingService: AnimeReleaseRatingService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Создать оценку аниме',
    description: 'Создает новую оценку аниме для текущего пользователя',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме для оценки',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiBody({
    type: CreateAnimeRatingDto,
    description: 'Данные для создания оценки',
  })
  @ApiResponse({
    status: 201,
    description: 'Оценка успешно создана',
    type: AnimeRatingResponseDto,
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
    description: 'Оценка уже существует для данного аниме',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  create(
    @Request() req,
    @Param('animeId') animeId: string,
    @Body() createDto: CreateAnimeRatingDto,
  ) {
    return this.animeReleaseRatingService.create(req.user.id, {
      ...createDto,
      anime_id: animeId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все оценки аниме',
    description: 'Возвращает список всех оценок для указанного аниме',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Список оценок успешно получен',
    type: [AnimeRatingResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено',
  })
  findAll(@Param('animeId') animeId: string) {
    return this.animeReleaseRatingService.findByAnime(animeId);
  }

  @Get('average')
  @ApiOperation({
    summary: 'Получить среднюю оценку аниме',
    description: 'Возвращает среднюю оценку и количество оценок для аниме',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
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
    description: 'Аниме не найдено',
  })
  getAverage(@Param('animeId') animeId: string) {
    return this.animeReleaseRatingService.getAverageRating(animeId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получить мою оценку аниме',
    description: 'Возвращает оценку текущего пользователя для указанного аниме',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Оценка пользователя успешно получена',
    type: AnimeRatingResponseDto,
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
  findMy(@Request() req, @Param('animeId') animeId: string) {
    return this.animeReleaseRatingService.findOne(req.user.id, animeId);
  }

  @Patch('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Обновить мою оценку аниме',
    description: 'Обновляет оценку текущего пользователя для указанного аниме',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateAnimeRatingDto,
    description: 'Новые данные оценки',
  })
  @ApiResponse({
    status: 200,
    description: 'Оценка успешно обновлена',
    type: AnimeRatingResponseDto,
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
    @Param('animeId') animeId: string,
    @Body() updateDto: UpdateAnimeRatingDto,
  ) {
    return this.animeReleaseRatingService.update(
      req.user.id,
      animeId,
      updateDto,
    );
  }

  @Delete('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Удалить мою оценку аниме',
    description: 'Удаляет оценку текущего пользователя для указанного аниме',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
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
  removeMy(@Request() req, @Param('animeId') animeId: string) {
    return this.animeReleaseRatingService.remove(req.user.id, animeId);
  }
}
