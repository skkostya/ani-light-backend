import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateUserAnimeDto,
  GetUserAnimeListDto,
  NextEpisodeResponseDto,
  PaginatedUserAnimeWithRelationsResponseDto,
  UpdateUserAnimeDto,
  UserAnimeResponseDto,
} from './dto/user-anime.dto';
import { UserAnimeService } from './user-anime.service';
import { UserEpisodeService } from './user-episode.service';

@ApiTags('users')
@Controller('user/anime')
@UseGuards(JwtAuthGuard)
export class UserAnimeController {
  constructor(
    private readonly userAnimeService: UserAnimeService,
    private readonly userEpisodeService: UserEpisodeService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Добавить аниме в список пользователя',
    description: 'Создает связь между пользователем и аниме с настройками',
  })
  @ApiBody({
    type: CreateUserAnimeDto,
    description: 'Данные для добавления аниме в список пользователя',
  })
  @ApiResponse({
    status: 201,
    description: 'Аниме успешно добавлено в список пользователя',
    type: UserAnimeResponseDto,
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
    description: 'Аниме не найдено',
  })
  @ApiResponse({
    status: 409,
    description: 'Аниме уже добавлено в список пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  create(@Request() req, @Body() createUserAnimeDto: CreateUserAnimeDto) {
    return this.userAnimeService.create(req.user.id, createUserAnimeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список аниме пользователя',
    description:
      'Возвращает все аниме, добавленные пользователем в свой список',
  })
  @ApiResponse({
    status: 200,
    description: 'Список аниме пользователя успешно получен',
    type: [UserAnimeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  findAll(@Request() req) {
    return this.userAnimeService.findByUser(req.user.id);
  }

  @Get('favorites')
  @ApiOperation({
    summary: 'Получить избранные аниме',
    description:
      'Возвращает список аниме, добавленных в избранное, с пагинацией',
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
    description:
      'Список избранных аниме успешно получен (с дополнительными связями: релизы аниме и жанры)',
    type: PaginatedUserAnimeWithRelationsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getFavorites(@Request() req, @Query() query: GetUserAnimeListDto) {
    return this.userAnimeService.getFavorites(req.user.id, query);
  }

  @Get('want-to-watch')
  @ApiOperation({
    summary: 'Получить список "Хочу посмотреть"',
    description:
      'Возвращает список аниме, добавленных в "Хочу посмотреть", с пагинацией',
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
    description:
      'Список "Хочу посмотреть" успешно получен (с дополнительными связями: релизы аниме и жанры)',
    type: PaginatedUserAnimeWithRelationsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getWantToWatch(@Request() req, @Query() query: GetUserAnimeListDto) {
    return this.userAnimeService.getWantToWatch(req.user.id, query);
  }

  @Get('next-episodes')
  @ApiOperation({
    summary: 'Получить следующие эпизоды для всех просматриваемых аниме',
    description:
      'Возвращает список аниме с информацией о следующих эпизодах для просмотра',
  })
  @ApiResponse({
    status: 200,
    description: 'Список аниме с следующими эпизодами успешно получен',
    type: [NextEpisodeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getNextEpisodes(@Request() req) {
    return this.userAnimeService.getNextEpisodesForWatchingAnime(req.user.id);
  }

  @Get('currently-watching')
  @ApiOperation({
    summary: 'Получить текущие просматриваемые аниме',
    description: 'Возвращает список аниме, которые пользователь сейчас смотрит',
  })
  @ApiResponse({
    status: 200,
    description: 'Список текущих просматриваемых аниме успешно получен',
    type: [UserAnimeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getCurrentlyWatching(@Request() req) {
    return this.userAnimeService.getCurrentlyWatchingAnime(req.user.id);
  }

  @Get('watch-history')
  @ApiOperation({
    summary: 'Получить историю просмотра аниме',
    description: 'Возвращает историю просмотра аниме пользователя с пагинацией',
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
    description: 'История просмотра аниме успешно получена',
    type: PaginatedUserAnimeWithRelationsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getWatchHistory(@Request() req, @Query() query: GetUserAnimeListDto) {
    return this.userAnimeService.getWatchHistory(
      req.user.id,
      query.page,
      query.limit,
    );
  }

  @Get(':animeId')
  @ApiOperation({
    summary: 'Получить информацию об аниме пользователя',
    description:
      'Возвращает информацию о конкретном аниме в списке пользователя',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация об аниме пользователя успешно получена',
    type: UserAnimeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  findOne(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.findOne(req.user.id, animeId);
  }

  @Patch(':animeId')
  @ApiOperation({
    summary: 'Обновить настройки аниме пользователя',
    description: 'Обновляет настройки аниме в списке пользователя',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateUserAnimeDto,
    description: 'Новые настройки аниме',
  })
  @ApiResponse({
    status: 200,
    description: 'Настройки аниме успешно обновлены',
    type: UserAnimeResponseDto,
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
    description: 'Аниме не найдено в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  update(
    @Request() req,
    @Param('animeId') animeId: string,
    @Body() updateUserAnimeDto: UpdateUserAnimeDto,
  ) {
    return this.userAnimeService.update(
      req.user.id,
      animeId,
      updateUserAnimeDto,
    );
  }

  @Post(':animeId/toggle-favorite')
  @ApiOperation({
    summary: 'Переключить статус избранного',
    description: 'Добавляет или убирает аниме из избранного',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Статус избранного успешно изменен',
    type: UserAnimeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  toggleFavorite(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.toggleFavorite(req.user.id, animeId);
  }

  @Post(':animeId/toggle-want-to-watch')
  @ApiOperation({
    summary: 'Переключить статус "Хочу посмотреть"',
    description: 'Добавляет или убирает аниме из списка "Хочу посмотреть"',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Статус "Хочу посмотреть" успешно изменен',
    type: UserAnimeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  toggleWantToWatch(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.toggleWantToWatch(req.user.id, animeId);
  }

  @Delete(':animeId')
  @ApiOperation({
    summary: 'Удалить аниме из списка пользователя',
    description: 'Удаляет аниме из списка пользователя',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Аниме успешно удалено из списка пользователя',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  remove(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.remove(req.user.id, animeId);
  }

  @Delete(':animeId/stop-watching')
  @ApiOperation({
    summary: 'Прекратить просмотр аниме',
    description: 'Удаляет аниме из списка просмотра и сбрасывает прогресс',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Просмотр аниме успешно прекращен',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  stopWatching(@Request() req, @Param('animeId') animeId: string) {
    return this.userEpisodeService.stopWatchingAnime(req.user.id, animeId);
  }

  @Get(':animeId/next-episode')
  @ApiOperation({
    summary: 'Получить следующий эпизод для конкретного аниме',
    description:
      'Возвращает информацию о следующем эпизоде для указанного аниме',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о следующем эпизоде успешно получена',
    type: NextEpisodeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Аниме не найдено в списке пользователя',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getNextEpisodeForAnime(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.getNextEpisodesForAnime(req.user.id, animeId);
  }
}
