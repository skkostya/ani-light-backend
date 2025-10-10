import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Genre } from '../../dictionaries/entities/genre.entity';
import { Anime } from './anime.entity';

@Entity('anime_genres')
export class AnimeGenre {
  @PrimaryColumn('uuid')
  anime_id: string;

  @PrimaryColumn('uuid')
  genre_id: string;

  @ManyToOne(() => Anime, (anime) => anime.animeGenres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'anime_id' })
  anime: Anime;

  @ManyToOne(() => Genre, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'genre_id' })
  genre: Genre;
}
