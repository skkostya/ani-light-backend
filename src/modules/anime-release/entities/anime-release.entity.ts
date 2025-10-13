import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';
import { AgeRating } from '../../dictionaries/entities/age-rating.entity';
import { Episode } from '../../episode/entities/episode.entity';
import { AnimeGenre } from './anime-release-genre.entity';

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

@Entity('anime_release')
export class AnimeRelease {
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

  @Column({ nullable: true })
  age_rating_id?: string;

  @Column()
  year: number;

  @Column()
  poster_url: string;

  // Новые поля из AniLibria API
  @Column({ nullable: true })
  alias?: string;

  @Column({ default: false })
  is_blocked_by_geo: boolean;

  @Column({ default: false })
  is_ongoing: boolean;

  @Column('jsonb', { nullable: true })
  publish_day?: {
    value: number;
    description: string;
  };

  @Column({ nullable: true })
  episodes_total?: number;

  @Column({ nullable: true })
  average_duration_of_episode?: number;

  @Column({ nullable: true })
  external_created_at?: Date;

  @Column({ nullable: true })
  anime_id?: string;

  @ManyToOne(() => Anime, (anime) => anime.animeReleases, { nullable: true })
  @JoinColumn({ name: 'anime_id' })
  anime?: Anime;

  @OneToMany(() => Episode, (episode) => episode.animeRelease)
  @JoinColumn()
  episodes: Episode[];

  @OneToMany('AnimeRating', 'anime')
  ratings: AnimeRatingRelation[];

  // Связи с справочниками
  @ManyToOne(() => AgeRating, { nullable: true })
  @JoinColumn({ name: 'age_rating_id' })
  ageRating?: AgeRating;

  @OneToMany(() => AnimeGenre, (animeGenre) => animeGenre.animeRelease)
  animeGenres: AnimeGenre[];
}
