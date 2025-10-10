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
import { Episode } from '../../episode/entities/episode.entity';
import { User } from './user.entity';

export enum EpisodeWatchStatus {
  NOT_WATCHED = 'not_watched',
  WATCHING = 'watching',
  WATCHED = 'watched',
}

@Entity()
@Index(['user_id', 'episode_id'], { unique: true })
export class UserEpisode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userEpisodes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Episode, (episode) => episode.userEpisodes)
  @JoinColumn({ name: 'episode_id' })
  episode: Episode;

  @Column('uuid')
  episode_id: string;

  @Column({
    type: 'enum',
    enum: EpisodeWatchStatus,
    default: EpisodeWatchStatus.NOT_WATCHED,
  })
  status: EpisodeWatchStatus;

  @Column({ type: 'timestamp', nullable: true })
  last_watched_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  watched_until_end_at?: Date;

  @Column({ type: 'integer', nullable: true })
  rating?: number; // Рейтинг от 1 до 10

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
