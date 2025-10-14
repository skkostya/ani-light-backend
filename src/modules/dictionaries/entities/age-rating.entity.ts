import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AnimeRelease } from '../../anime-release/entities/anime-release.entity';

@Entity('age_ratings')
export class AgeRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  value: string; // R0_PLUS, R6_PLUS, R12_PLUS, R16_PLUS, R18_PLUS

  @Column()
  label: string; // 0+, 6+, 12+, 16+, 18+

  @Column('text')
  description: string; // Описание ограничения по возрасту

  // Обратная связь с anime-release
  @OneToMany(() => AnimeRelease, (animeRelease) => animeRelease.ageRating)
  animeReleases: AnimeRelease[];
}
