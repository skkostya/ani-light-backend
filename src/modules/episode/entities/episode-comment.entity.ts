import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CommentReaction, ReactionType } from './comment-reaction.entity';
import { Episode } from './episode.entity';

@Entity()
export class EpisodeComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.episodeComments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Episode, (episode) => episode.comments)
  @JoinColumn({ name: 'episode_id' })
  episode: Episode;

  @Column('uuid')
  episode_id: string;

  @ManyToOne(() => EpisodeComment, (comment) => comment.replies)
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment?: EpisodeComment;

  @Column('uuid', { nullable: true })
  parent_comment_id?: string;

  @OneToMany(() => EpisodeComment, (comment) => comment.parentComment)
  replies: EpisodeComment[];

  @OneToMany(() => CommentReaction, (reaction) => reaction.comment)
  reactions: CommentReaction[];

  @Column('text')
  content: string;

  @Column({ default: true })
  is_approved: boolean; // Комментарии видны сразу, но можно модерировать

  @Column({ default: false })
  is_deleted: boolean; // Мягкое удаление

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Виртуальные поля для подсчета реакций
  get likesCount(): number {
    return (
      this.reactions?.filter((r) => r.reaction_type === ReactionType.LIKE)
        .length || 0
    );
  }

  get dislikesCount(): number {
    return (
      this.reactions?.filter((r) => r.reaction_type === ReactionType.DISLIKE)
        .length || 0
    );
  }
}
