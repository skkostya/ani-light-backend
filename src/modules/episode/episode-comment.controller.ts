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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CommentReactionDto,
  CreateEpisodeCommentDto,
  UpdateEpisodeCommentDto,
} from './dto/episode-comment.dto';
import { EpisodeCommentService } from './episode-comment.service';

@Controller('episodes/:episodeId/comments')
export class EpisodeCommentController {
  constructor(private readonly commentService: EpisodeCommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  findAll(
    @Param('episodeId') episodeId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.commentService.findByEpisode(episodeId, page, limit);
  }

  @Get(':commentId')
  findOne(@Param('commentId') commentId: string) {
    return this.commentService.findOne(commentId);
  }

  @Get(':commentId/replies')
  getReplies(
    @Param('commentId') commentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.commentService.getReplies(commentId, page, limit);
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body() updateDto: UpdateEpisodeCommentDto,
  ) {
    return this.commentService.update(req.user.id, commentId, updateDto);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('commentId') commentId: string) {
    // TODO: Добавить проверку на админа
    const isAdmin = false; // req.user.role === 'admin'
    return this.commentService.delete(req.user.id, commentId, isAdmin);
  }

  @Post(':commentId/reactions')
  @UseGuards(JwtAuthGuard)
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
  removeReaction(@Request() req, @Param('commentId') commentId: string) {
    return this.commentService.removeReaction(req.user.id, commentId);
  }

  @Get(':commentId/reactions/my')
  @UseGuards(JwtAuthGuard)
  getMyReaction(@Request() req, @Param('commentId') commentId: string) {
    return this.commentService.getUserReaction(req.user.id, commentId);
  }

  @Get(':commentId/stats')
  getCommentStats(@Param('commentId') commentId: string) {
    return this.commentService.getCommentStats(commentId);
  }
}
