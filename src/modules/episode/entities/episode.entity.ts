import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';

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

  @ManyToOne(() => Anime, (anime) => anime.episodes)
  @JoinColumn({ name: 'anime_id' })
  anime: Anime;

  @Column()
  number: number;

  @Column()
  video_url: string;

  @Column({ nullable: true })
  subtitles_url?: string;

  @Column('uuid')
  anime_id: string;

  @OneToMany('UserEpisode', 'episode')
  userEpisodes: UserEpisodeRelation[];

  @OneToMany('EpisodeComment', 'episode')
  comments: EpisodeCommentRelation[];

  @OneToMany('EpisodeRating', 'episode')
  ratings: EpisodeRatingRelation[];
}
