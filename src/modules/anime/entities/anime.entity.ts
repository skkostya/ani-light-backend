import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Episode } from '../../episode/entities/episode.entity';

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
}
