import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnimeRelease } from '../../anime-release/entities/anime-release.entity';

// Интерфейсы для типизации связей
export interface UserEpisodeRelation {
  id: string;
  user_id: string;
  episode_id: string;
  status: 'not_watched' | 'watching' | 'watched';
  last_watched_at?: Date;
  watched_until_end_at?: Date;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}

export interface EpisodeCommentRelation {
  id: string;
  user_id: string;
  episode_id: string;
  parent_comment_id?: string;
  content: string;
  is_approved: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EpisodeRatingRelation {
  id: string;
  user_id: string;
  episode_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

@Entity()
export class Episode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AnimeRelease, (animeRelease) => animeRelease.episodes)
  @JoinColumn({ name: 'anime_id' })
  animeRelease: AnimeRelease;

  @Column()
  number: number;

  @Column()
  video_url: string;

  @Column({ nullable: true })
  subtitles_url?: string;

  // Новые поля для качества видео
  @Column({ nullable: true })
  video_url_480?: string;

  @Column({ nullable: true })
  video_url_720?: string;

  @Column({ nullable: true })
  video_url_1080?: string;

  // Поля для времени opening и ending
  @Column('json', { nullable: true })
  opening?: {
    start: number;
    stop: number;
  };

  @Column('json', { nullable: true })
  ending?: {
    start: number;
    stop: number;
  };

  // Продолжительность эпизода в секундах
  @Column({ nullable: true })
  duration?: number;

  // Превью изображение эпизода
  @Column({ nullable: true })
  preview_image?: string;

  @Column('uuid')
  anime_id: string;

  @OneToMany('UserEpisode', 'episode')
  userEpisodes: UserEpisodeRelation[];

  @OneToMany('EpisodeComment', 'episode')
  comments: EpisodeCommentRelation[];

  @OneToMany('EpisodeRating', 'episode')
  ratings: EpisodeRatingRelation[];
}
