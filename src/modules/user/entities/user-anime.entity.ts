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
import { Anime } from '../../anime/entities/anime.entity';
import { User } from './user.entity';

@Entity()
@Index(['user_id', 'anime_id'], { unique: true })
export class UserAnime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userAnime)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Anime, (anime) => anime.userAnime)
  @JoinColumn({ name: 'anime_id' })
  anime: Anime;

  @Column('uuid')
  anime_id: string;

  @Column({ default: false })
  is_favorite: boolean;

  @Column({ default: false })
  want_to_watch: boolean;

  @Column({ default: false })
  notifications_telegram: boolean;

  @Column({ default: false })
  notifications_email: boolean;

  @Column({ type: 'integer', nullable: true })
  rating?: number; // Рейтинг от 1 до 10

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
