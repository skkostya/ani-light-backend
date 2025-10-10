import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EpisodeComment } from './episode-comment.entity';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity()
@Index(['user_id', 'comment_id'], { unique: true })
export class CommentReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.commentReactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => EpisodeComment, (comment) => comment.reactions)
  @JoinColumn({ name: 'comment_id' })
  comment: EpisodeComment;

  @Column('uuid')
  comment_id: string;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  reaction_type: ReactionType;

  @CreateDateColumn()
  created_at: Date;
}
