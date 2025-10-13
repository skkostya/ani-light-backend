import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Genre } from '../../dictionaries/entities/genre.entity';
import { AnimeRelease } from './anime-release.entity';

@Entity('anime_genres')
export class AnimeGenre {
  @PrimaryColumn('uuid')
  anime_id: string;

  @PrimaryColumn('uuid')
  genre_id: string;

  @ManyToOne(() => AnimeRelease, (animeRelease) => animeRelease.animeGenres, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'anime_id' })
  animeRelease: AnimeRelease;

  @ManyToOne(() => Genre, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'genre_id' })
  genre: Genre;
}
