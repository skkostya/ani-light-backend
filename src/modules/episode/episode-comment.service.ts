import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfanityFilterService } from '../../common/services/profanity-filter.service';
import {
  CommentReactionDto,
  CreateEpisodeCommentDto,
  UpdateEpisodeCommentDto,
} from './dto/episode-comment.dto';
import {
  CommentReaction,
  ReactionType,
} from './entities/comment-reaction.entity';
import { EpisodeComment } from './entities/episode-comment.entity';

@Injectable()
export class EpisodeCommentService {
  constructor(
    @InjectRepository(EpisodeComment)
    private commentRepository: Repository<EpisodeComment>,
    @InjectRepository(CommentReaction)
    private reactionRepository: Repository<CommentReaction>,
    private profanityFilter: ProfanityFilterService,
  ) {}

  async create(
    userId: string,
    createDto: CreateEpisodeCommentDto,
  ): Promise<EpisodeComment> {
    // Проверяем текст на маты
    const validation = this.profanityFilter.validateAndClean(createDto.content);

    if (!validation.isClean) {
      throw new BadRequestException(
        'Комментарий содержит нецензурную лексику. Пожалуйста, переформулируйте ваше сообщение.',
      );
    }

    const comment = this.commentRepository.create({
      user_id: userId,
      ...createDto,
      content: validation.cleanedText,
    });

    return this.commentRepository.save(comment);
  }

  async update(
    userId: string,
    commentId: string,
    updateDto: UpdateEpisodeCommentDto,
  ): Promise<EpisodeComment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, user_id: userId },
    });

    if (!comment) {
      throw new NotFoundException(
        'Комментарий не найден или у вас нет прав на его редактирование',
      );
    }

    if (comment.is_deleted) {
      throw new ForbiddenException(
        'Нельзя редактировать удаленный комментарий',
      );
    }

    // Проверяем обновленный текст на маты
    const validation = this.profanityFilter.validateAndClean(updateDto.content);

    if (!validation.isClean) {
      throw new BadRequestException(
        'Комментарий содержит нецензурную лексику. Пожалуйста, переформулируйте ваше сообщение.',
      );
    }

    Object.assign(comment, updateDto, { content: validation.cleanedText });
    return this.commentRepository.save(comment);
  }

  async findOne(commentId: string): Promise<EpisodeComment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, is_deleted: false },
      relations: ['user', 'replies', 'reactions'],
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return comment;
  }

  async findByEpisode(
    episodeId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: EpisodeComment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: {
        episode_id: episodeId,
        parent_comment_id: null as any, // Только корневые комментарии
        is_deleted: false,
      },
      relations: ['user', 'replies', 'reactions'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getReplies(
    commentId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: EpisodeComment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const [replies, total] = await this.commentRepository.findAndCount({
      where: {
        parent_comment_id: commentId,
        is_deleted: false,
      },
      relations: ['user', 'reactions'],
      order: { created_at: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: replies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async delete(
    userId: string,
    commentId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Проверяем права на удаление
    if (!isAdmin && comment.user_id !== userId) {
      throw new ForbiddenException(
        'У вас нет прав на удаление этого комментария',
      );
    }

    if (isAdmin) {
      // Админ может полностью удалить комментарий
      await this.commentRepository.remove(comment);
    } else {
      // Пользователь может только пометить как удаленный
      comment.is_deleted = true;
      await this.commentRepository.save(comment);
    }
  }

  async addReaction(
    userId: string,
    reactionDto: CommentReactionDto,
  ): Promise<CommentReaction> {
    // Проверяем, не существует ли уже реакция от этого пользователя
    const existing = await this.reactionRepository.findOne({
      where: { user_id: userId, comment_id: reactionDto.comment_id },
    });

    if (existing) {
      // Обновляем существующую реакцию
      existing.reaction_type = reactionDto.reaction_type as ReactionType;
      return this.reactionRepository.save(existing);
    }

    const reaction = this.reactionRepository.create({
      user_id: userId,
      comment_id: reactionDto.comment_id,
      reaction_type: reactionDto.reaction_type as ReactionType,
    });

    return this.reactionRepository.save(reaction);
  }

  async removeReaction(userId: string, commentId: string): Promise<void> {
    const result = await this.reactionRepository.delete({
      user_id: userId,
      comment_id: commentId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Реакция не найдена');
    }
  }

  async getUserReaction(
    userId: string,
    commentId: string,
  ): Promise<CommentReaction | null> {
    return this.reactionRepository.findOne({
      where: { user_id: userId, comment_id: commentId },
    });
  }

  async getCommentStats(
    commentId: string,
  ): Promise<{ likes: number; dislikes: number }> {
    const [likes, dislikes] = await Promise.all([
      this.reactionRepository.count({
        where: { comment_id: commentId, reaction_type: ReactionType.LIKE },
      }),
      this.reactionRepository.count({
        where: { comment_id: commentId, reaction_type: ReactionType.DISLIKE },
      }),
    ]);

    return { likes, dislikes };
  }
}
