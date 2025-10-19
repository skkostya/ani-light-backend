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
import { Anime } from '../../anime/entities/anime.entity';
import { Episode } from '../../episode/entities/episode.entity';
import { User } from './user.entity';

@Entity()
@Index(['user_id', 'anime_id'], { unique: true })
export class UserAnime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userAnime)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Anime, (anime) => anime.userAnime)
  @JoinColumn({ name: 'anime_id' })
  anime: Anime;

  @Column('uuid')
  anime_id: string;

  @Column({ default: false })
  is_favorite: boolean;

  @Column({ default: false })
  want_to_watch: boolean;

  // НОВЫЕ ПОЛЯ ДЛЯ ОТСЛЕЖИВАНИЯ ПРОСМОТРА
  @Column({ default: false })
  is_watching: boolean; // Флаг "сейчас смотрю"

  @Column('uuid', { nullable: true })
  last_watched_episode_id?: string; // ID последнего просмотренного эпизода

  @Column({ type: 'timestamp', nullable: true })
  last_watched_at?: Date; // Дата последнего просмотра

  @Column({ default: false })
  notifications_telegram: boolean;

  @Column({ default: false })
  notifications_email: boolean;

  @Column({ type: 'integer', nullable: true })
  rating?: number; // Рейтинг от 1 до 10

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Связь с последним просмотренным эпизодом
  @ManyToOne(() => Episode, { nullable: true })
  @JoinColumn({ name: 'last_watched_episode_id' })
  lastWatchedEpisode?: Episode;
}
