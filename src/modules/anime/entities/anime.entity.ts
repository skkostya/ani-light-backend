import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Episode } from '../../episode/entities/episode.entity';

// Интерфейсы для типизации связей
export interface UserAnimeRelation {
  id: string;
  user_id: string;
  anime_id: string;
  is_favorite: boolean;
  want_to_watch: boolean;
  notifications_telegram: boolean;
  notifications_email: boolean;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}

export interface AnimeRatingRelation {
  id: string;
  user_id: string;
  anime_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

@Entity()
export class Anime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  external_id?: number; // Для связи с AniLibria API ID

  @Column()
  title_ru: string;

  @Column()
  title_en: string;

  @Column('text')
  description: string;

  @Column('text', { array: true })
  genres: string[];

  @Column()
  year: number;

  @Column()
  poster_url: string;

  @OneToMany(() => Episode, (episode) => episode.anime)
  @JoinColumn()
  episodes: Episode[];

  @OneToMany('UserAnime', 'anime')
  userAnime: UserAnimeRelation[];

  @OneToMany('AnimeRating', 'anime')
  ratings: AnimeRatingRelation[];
}
