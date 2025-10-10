import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEpisodeCommentDto {
  @ApiProperty({
    description: 'ID эпизода для комментария',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  @IsUUID()
  episode_id: string;

  @ApiPropertyOptional({
    description: 'ID родительского комментария (для ответов)',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parent_comment_id?: string;

  @ApiProperty({
    description: 'Текст комментария',
    example: 'Отличный эпизод! Очень понравилась анимация.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

export class UpdateEpisodeCommentDto {
  @ApiProperty({
    description: 'Новый текст комментария',
    example: 'Обновленный комментарий с исправлениями.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

export class EpisodeCommentResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор комментария',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID пользователя, написавшего комментарий',
    example: 'uuid-user-id',
    format: 'uuid',
  })
  user_id: string;

  @ApiProperty({
    description: 'ID эпизода',
    example: 'uuid-episode-id',
    format: 'uuid',
  })
  episode_id: string;

  @ApiPropertyOptional({
    description: 'ID родительского комментария',
    example: 'uuid-parent-comment-id',
    format: 'uuid',
  })
  parent_comment_id?: string;

  @ApiProperty({
    description: 'Текст комментария',
    example: 'Отличный эпизод! Очень понравилась анимация.',
  })
  content: string;

  @ApiProperty({
    description: 'Одобрен ли комментарий модератором',
    example: true,
  })
  is_approved: boolean;

  @ApiProperty({
    description: 'Удален ли комментарий',
    example: false,
  })
  is_deleted: boolean;

  @ApiProperty({
    description: 'Дата создания комментария',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Дата последнего обновления комментария',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Информация о пользователе',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'uuid-user-id' },
      username: { type: 'string', example: 'username' },
    },
  })
  user: {
    id: string;
    username: string;
  };

  @ApiPropertyOptional({
    description: 'Ответы на комментарий',
    type: [EpisodeCommentResponseDto],
  })
  replies?: EpisodeCommentResponseDto[];

  @ApiProperty({
    description: 'Количество лайков',
    example: 15,
  })
  likes_count: number;

  @ApiProperty({
    description: 'Количество дизлайков',
    example: 2,
  })
  dislikes_count: number;

  @ApiPropertyOptional({
    description: 'Реакция текущего пользователя',
    example: 'like',
    enum: ['like', 'dislike'],
  })
  user_reaction?: 'like' | 'dislike';
}

export class CommentReactionDto {
  @ApiProperty({
    description: 'ID комментария для реакции',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  @IsUUID()
  comment_id: string;

  @ApiProperty({
    description: 'Тип реакции',
    example: 'like',
    enum: ['like', 'dislike'],
  })
  @IsNotEmpty()
  @IsIn(['like', 'dislike'])
  reaction_type: 'like' | 'dislike';
}

export class CommentReactionResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор реакции',
    example: 'uuid-reaction-id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID пользователя',
    example: 'uuid-user-id',
    format: 'uuid',
  })
  user_id: string;

  @ApiProperty({
    description: 'ID комментария',
    example: 'uuid-comment-id',
    format: 'uuid',
  })
  comment_id: string;

  @ApiProperty({
    description: 'Тип реакции',
    example: 'like',
    enum: ['like', 'dislike'],
  })
  reaction_type: 'like' | 'dislike';

  @ApiProperty({
    description: 'Дата создания реакции',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  created_at: Date;
}
