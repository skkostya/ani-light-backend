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
  CreateUserEpisodeDto,
  MarkEpisodeWatchedDto,
  UpdateUserEpisodeDto,
  UserEpisodeResponseDto,
  UserEpisodeWithAnimeInfoResponseDto,
} from './dto/user-episode.dto';
import { UserEpisodeService } from './user-episode.service';

@ApiTags('users')
@Controller('user/episodes')
@UseGuards(JwtAuthGuard)
export class UserEpisodeController {
  constructor(private readonly userEpisodeService: UserEpisodeService) {}

  @Post()
  @ApiOperation({
    summary: 'Добавить эпизод в список пользователя',
    description:
      'Создает связь между пользователем и эпизодом с настройками просмотра',
  })
  @ApiBody({
    type: CreateUserEpisodeDto,
    description: 'Данные для добавления эпизода в список пользователя',
  })
  @ApiResponse({
    status: 201,
    description: 'Эпизод успешно добавлен в список пользователя',
    type: UserEpisodeResponseDto,
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
    description: 'Эпизод не найден',
  })
  @ApiResponse({
    status: 409,
    description: 'Эпизод уже добавлен в список пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  create(@Request() req, @Body() createUserEpisodeDto: CreateUserEpisodeDto) {
    return this.userEpisodeService.create(req.user.id, createUserEpisodeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список эпизодов пользователя',
    description:
      'Возвращает все эпизоды, добавленные пользователем в свой список',
  })
  @ApiResponse({
    status: 200,
    description: 'Список эпизодов пользователя успешно получен',
    type: [UserEpisodeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  findAll(@Request() req) {
    return this.userEpisodeService.findByUser(req.user.id);
  }

  @Get('watched')
  @ApiOperation({
    summary: 'Получить просмотренные эпизоды',
    description: 'Возвращает список эпизодов со статусом "просмотрено"',
  })
  @ApiResponse({
    status: 200,
    description: 'Список просмотренных эпизодов успешно получен',
    type: [UserEpisodeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getWatched(@Request() req) {
    return this.userEpisodeService.getWatchedEpisodes(req.user.id);
  }

  @Get('watching')
  @ApiOperation({
    summary: 'Получить эпизоды в процессе просмотра',
    description: 'Возвращает список эпизодов со статусом "смотрю"',
  })
  @ApiResponse({
    status: 200,
    description: 'Список эпизодов в процессе просмотра успешно получен',
    type: [UserEpisodeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getWatching(@Request() req) {
    return this.userEpisodeService.getWatchingEpisodes(req.user.id);
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Получить последние просмотренные эпизоды',
    description:
      'Возвращает список последних просмотренных эпизодов с информацией об аниме и релизе',
  })
  @ApiResponse({
    status: 200,
    description: 'Список последних просмотренных эпизодов успешно получен',
    type: [UserEpisodeWithAnimeInfoResponseDto],
    schema: {
      example: [
        {
          id: 'user-episode-uuid',
          user_id: 'user-uuid',
          episode_id: 'episode-uuid',
          status: 'watched',
          last_watched_at: '2024-01-01T00:00:00.000Z',
          watched_until_end_at: '2024-01-01T00:00:00.000Z',
          rating: 8,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          episode: {
            id: 'episode-uuid',
            anime_release_id: 'anime-release-uuid',
            anime_id: 'anime-uuid',
            number: 1,
            video_url: 'https://example.com/video.mp4',
            subtitles_url: 'https://example.com/subtitles.vtt',
            video_url_480: 'https://example.com/video480.mp4',
            video_url_720: 'https://example.com/video720.mp4',
            video_url_1080: 'https://example.com/video1080.mp4',
            duration: 1440,
            preview_image: 'https://example.com/preview.jpg',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getLastWatched(@Request() req) {
    return this.userEpisodeService.getLastWatchedEpisodes(req.user.id);
  }

  @Get(':episodeId')
  @ApiOperation({
    summary: 'Получить информацию об эпизоде пользователя',
    description:
      'Возвращает информацию о конкретном эпизоде в списке пользователя',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация об эпизоде пользователя успешно получена',
    type: UserEpisodeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  findOne(@Request() req, @Param('episodeId') episodeId: string) {
    return this.userEpisodeService.findOne(req.user.id, episodeId);
  }

  @Patch(':episodeId')
  @ApiOperation({
    summary: 'Обновить настройки эпизода пользователя',
    description: 'Обновляет настройки эпизода в списке пользователя',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateUserEpisodeDto,
    description: 'Новые настройки эпизода',
  })
  @ApiResponse({
    status: 200,
    description: 'Настройки эпизода успешно обновлены',
    type: UserEpisodeResponseDto,
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
    description: 'Эпизод не найден в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  update(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() updateUserEpisodeDto: UpdateUserEpisodeDto,
  ) {
    return this.userEpisodeService.update(
      req.user.id,
      episodeId,
      updateUserEpisodeDto,
    );
  }

  @Post(':episodeId/mark-watched')
  @ApiOperation({
    summary: 'Отметить эпизод как просмотренный',
    description: 'Устанавливает статус эпизода как "просмотренный"',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiBody({
    type: MarkEpisodeWatchedDto,
    description: 'Данные для отметки эпизода как просмотренного',
  })
  @ApiResponse({
    status: 200,
    description: 'Эпизод успешно отмечен как просмотренный',
    type: UserEpisodeResponseDto,
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
    description: 'Эпизод не найден в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  markAsWatched(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() markDto: MarkEpisodeWatchedDto,
  ) {
    return this.userEpisodeService.markAsWatched(
      req.user.id,
      episodeId,
      markDto,
    );
  }

  @Post(':episodeId/mark-watching')
  @ApiOperation({
    summary: 'Отметить эпизод как "смотрю"',
    description: 'Устанавливает статус эпизода как "в процессе просмотра"',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Эпизод успешно отмечен как "смотрю"',
    type: UserEpisodeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  markAsWatching(@Request() req, @Param('episodeId') episodeId: string) {
    return this.userEpisodeService.markAsWatching(req.user.id, episodeId);
  }

  @Delete(':episodeId')
  @ApiOperation({
    summary: 'Удалить эпизод из списка пользователя',
    description: 'Удаляет эпизод из списка пользователя',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Эпизод успешно удален из списка пользователя',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  remove(@Request() req, @Param('episodeId') episodeId: string) {
    return this.userEpisodeService.remove(req.user.id, episodeId);
  }
}
