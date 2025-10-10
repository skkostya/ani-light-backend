import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Anime } from './anime.entity';

@Entity()
@Index(['user_id', 'anime_id'], { unique: true })
export class AnimeRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.animeRatings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Anime, (anime) => anime.ratings)
  @JoinColumn({ name: 'anime_id' })
  anime: Anime;

  @Column('uuid')
  anime_id: string;

  @Column({ type: 'integer' })
  rating: number; // Рейтинг от 1 до 10

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
