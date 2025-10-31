import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { ExtractedColors } from '../../../common/services/color-extractor.service';
import { AnimeRelease } from '../../anime-release/entities/anime-release.entity';
import { UserAnime } from '../../user/entities/user-anime.entity';

@Entity('anime')
export class Anime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  external_id?: string;

  @Column()
  name: string;

  @Column()
  name_english: string;

  @Column({ nullable: true })
  alias?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number;

  @Column({ nullable: true })
  last_year?: number;

  @Column({ nullable: true })
  first_year?: number;

  @Column({ default: 0 })
  total_releases: number;

  @Column({ default: 0 })
  total_episodes: number;

  @Column({ nullable: true })
  total_duration?: string;

  @Column({ default: 0 })
  total_duration_in_seconds: number;

  @Column('jsonb', { nullable: true })
  accent_colors?: ExtractedColors;

  // Связь с anime-release (один anime может иметь много anime-release)
  @OneToMany(() => AnimeRelease, (animeRelease) => animeRelease.anime)
  animeReleases: AnimeRelease[];

  // Связь с user-anime (один anime может быть связан с многими пользователями)
  @OneToMany(() => UserAnime, (userAnime) => userAnime.anime)
  userAnime: UserAnime[];
}
