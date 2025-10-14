import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AnimeGenre } from '../../anime-release/entities/anime-release-genre.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  external_id: number; // ID из внешней системы (AniLibria API)

  @Column()
  name: string;

  @Column('jsonb')
  image: {
    optimized_preview: string;
    preview: string;
  };

  // Обратная связь с anime-release через anime-release-genre
  @OneToMany(() => AnimeGenre, (animeGenre) => animeGenre.genre)
  animeGenres: AnimeGenre[];
}
