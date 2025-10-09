import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Anime } from '../../anime/entities/anime.entity';

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
}
