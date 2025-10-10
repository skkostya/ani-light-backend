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
  CommentReactionDto,
  CommentReactionResponseDto,
  CreateEpisodeCommentDto,
  EpisodeCommentResponseDto,
  UpdateEpisodeCommentDto,
} from './dto/episode-comment.dto';
import { EpisodeCommentService } from './episode-comment.service';

@ApiTags('episodes')
@Controller('episodes/:episodeId/comments')
export class EpisodeCommentController {
  constructor(private readonly commentService: EpisodeCommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Создать комментарий к эпизоду',
    description:
      'Создает новый комментарий к эпизоду или ответ на существующий комментарий',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода для комментария',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiBody({
    type: CreateEpisodeCommentDto,
    description: 'Данные для создания комментария',
  })
  @ApiResponse({
    status: 201,
    description: 'Комментарий успешно создан',
    type: EpisodeCommentResponseDto,
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  create(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() createDto: CreateEpisodeCommentDto,
  ) {
    return this.commentService.create(req.user.id, {
      ...createDto,
      episode_id: episodeId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Получить комментарии к эпизоду',
    description: 'Возвращает список комментариев к эпизоду с пагинацией',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'page',
    description: 'Номер страницы',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Количество комментариев на странице',
    example: 20,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Список комментариев успешно получен',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/EpisodeCommentResponseDto' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Эпизод не найден',
  })
  findAll(
    @Param('episodeId') episodeId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.commentService.findByEpisode(episodeId, page, limit);
  }

  @Get(':commentId')
  @ApiOperation({
    summary: 'Получить комментарий по ID',
    description: 'Возвращает подробную информацию о комментарии',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID комментария',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Комментарий успешно получен',
    type: EpisodeCommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Комментарий не найден',
  })
  findOne(@Param('commentId') commentId: string) {
    return this.commentService.findOne(commentId);
  }

  @Get(':commentId/replies')
  @ApiOperation({
    summary: 'Получить ответы на комментарий',
    description:
      'Возвращает список ответов на указанный комментарий с пагинацией',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID родительского комментария',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'page',
    description: 'Номер страницы',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Количество ответов на странице',
    example: 20,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Список ответов успешно получен',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/EpisodeCommentResponseDto' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Комментарий не найден',
  })
  getReplies(
    @Param('commentId') commentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.commentService.getReplies(commentId, page, limit);
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Обновить комментарий',
    description: 'Обновляет текст комментария (только автор комментария)',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID комментария для обновления',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateEpisodeCommentDto,
    description: 'Новые данные комментария',
  })
  @ApiResponse({
    status: 200,
    description: 'Комментарий успешно обновлен',
    type: EpisodeCommentResponseDto,
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
    status: 403,
    description: 'Нет прав на редактирование комментария',
  })
  @ApiResponse({
    status: 404,
    description: 'Комментарий не найден',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  update(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body() updateDto: UpdateEpisodeCommentDto,
  ) {
    return this.commentService.update(req.user.id, commentId, updateDto);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Удалить комментарий',
    description: 'Удаляет комментарий (автор или администратор)',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID комментария для удаления',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Комментарий успешно удален',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 403,
    description: 'Нет прав на удаление комментария',
  })
  @ApiResponse({
    status: 404,
    description: 'Комментарий не найден',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  remove(@Request() req, @Param('commentId') commentId: string) {
    // TODO: Добавить проверку на админа
    const isAdmin = false; // req.user.role === 'admin'
    return this.commentService.delete(req.user.id, commentId, isAdmin);
  }

  @Post(':commentId/reactions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Добавить реакцию к комментарию',
    description: 'Добавляет лайк или дизлайк к комментарию',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID комментария для реакции',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @ApiBody({
    type: CommentReactionDto,
    description: 'Данные реакции',
  })
  @ApiResponse({
    status: 201,
    description: 'Реакция успешно добавлена',
    type: CommentReactionResponseDto,
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
    description: 'Комментарий не найден',
  })
  @ApiResponse({
    status: 409,
    description: 'Реакция уже существует',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  addReaction(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body() reactionDto: CommentReactionDto,
  ) {
    return this.commentService.addReaction(req.user.id, {
      ...reactionDto,
      comment_id: commentId,
    });
  }

  @Delete(':commentId/reactions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Удалить реакцию к комментарию',
    description: 'Удаляет реакцию пользователя к комментарию',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID комментария',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Реакция успешно удалена',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Реакция не найдена',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  removeReaction(@Request() req, @Param('commentId') commentId: string) {
    return this.commentService.removeReaction(req.user.id, commentId);
  }

  @Get(':commentId/reactions/my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получить мою реакцию к комментарию',
    description: 'Возвращает реакцию текущего пользователя к комментарию',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID комментария',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Реакция пользователя успешно получена',
    type: CommentReactionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Реакция не найдена',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  getMyReaction(@Request() req, @Param('commentId') commentId: string) {
    return this.commentService.getUserReaction(req.user.id, commentId);
  }

  @Get(':commentId/stats')
  @ApiOperation({
    summary: 'Получить статистику комментария',
    description: 'Возвращает статистику реакций к комментарию',
  })
  @ApiParam({
    name: 'episodeId',
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID комментария',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика комментария успешно получена',
    schema: {
      type: 'object',
      properties: {
        likes_count: { type: 'number', example: 15 },
        dislikes_count: { type: 'number', example: 2 },
        total_reactions: { type: 'number', example: 17 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Комментарий не найден',
  })
  getCommentStats(@Param('commentId') commentId: string) {
    return this.commentService.getCommentStats(commentId);
  }
}
