import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEpisodeCommentDto {
  @IsUUID()
  episode_id: string;

  @IsOptional()
  @IsUUID()
  parent_comment_id?: string;

  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

export class UpdateEpisodeCommentDto {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

export class EpisodeCommentResponseDto {
  id: string;
  user_id: string;
  episode_id: string;
  parent_comment_id?: string;
  content: string;
  is_approved: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  user: {
    id: string;
    username: string;
  };
  replies?: EpisodeCommentResponseDto[];
  likes_count: number;
  dislikes_count: number;
  user_reaction?: 'like' | 'dislike';
}

export class CommentReactionDto {
  @IsUUID()
  comment_id: string;

  @IsNotEmpty()
  reaction_type: 'like' | 'dislike';
}

export class CommentReactionResponseDto {
  id: string;
  user_id: string;
  comment_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: Date;
}
