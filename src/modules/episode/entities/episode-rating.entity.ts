import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Episode } from './episode.entity';

@Entity()
@Index(['user_id', 'episode_id'], { unique: true })
export class EpisodeRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.episodeRatings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Episode, (episode) => episode.ratings)
  @JoinColumn({ name: 'episode_id' })
  episode: Episode;

  @Column('uuid')
  episode_id: string;

  @Column({ type: 'integer' })
  rating: number; // Рейтинг от 1 до 10

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
