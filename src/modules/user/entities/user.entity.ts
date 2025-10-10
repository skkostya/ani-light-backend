import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

export interface UserEpisodeRelation {
  id: string;
  user_id: string;
  episode_id: string;
  status: 'not_watched' | 'watching' | 'watched';
  last_watched_at?: Date;
  watched_until_end_at?: Date;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}

export interface EpisodeCommentRelation {
  id: string;
  user_id: string;
  episode_id: string;
  parent_comment_id?: string;
  content: string;
  is_approved: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CommentReactionRelation {
  id: string;
  user_id: string;
  comment_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: Date;
}

export interface AnimeRatingRelation {
  id: string;
  user_id: string;
  anime_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export interface EpisodeRatingRelation {
  id: string;
  user_id: string;
  episode_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export enum SubscriptionType {
  FREE = 'free',
  PREMIUM = 'premium',
  VIP = 'vip',
}

export enum AuthType {
  EMAIL = 'email',
  TELEGRAM = 'telegram',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ unique: true, nullable: true })
  telegram_id: string;

  @Column({
    type: 'enum',
    enum: AuthType,
    default: AuthType.EMAIL,
  })
  auth_type: AuthType;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.FREE,
  })
  subscription_type: SubscriptionType;

  @Column({ type: 'timestamp', nullable: true })
  subscription_expires_at?: Date;

  @Column({ default: true })
  is_active: boolean;

  // Настройки уведомлений профиля
  @Column({ default: true })
  notifications_enabled: boolean;

  @Column({ default: true })
  notifications_telegram_enabled: boolean;

  @Column({ default: true })
  notifications_email_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Связи с новыми сущностями
  @OneToMany('UserAnime', 'user')
  userAnime: UserAnimeRelation[];

  @OneToMany('UserEpisode', 'user')
  userEpisodes: UserEpisodeRelation[];

  @OneToMany('EpisodeComment', 'user')
  episodeComments: EpisodeCommentRelation[];

  @OneToMany('CommentReaction', 'user')
  commentReactions: CommentReactionRelation[];

  @OneToMany('AnimeRating', 'user')
  animeRatings: AnimeRatingRelation[];

  @OneToMany('EpisodeRating', 'user')
  episodeRatings: EpisodeRatingRelation[];

  // Виртуальное поле для проверки активной подписки
  get hasActiveSubscription(): boolean {
    if (this.subscription_type === SubscriptionType.FREE) {
      return false;
    }

    if (!this.subscription_expires_at) {
      return false;
    }

    return new Date() < this.subscription_expires_at;
  }

  // Виртуальное поле для проверки отключения рекламы
  get shouldHideAds(): boolean {
    return this.hasActiveSubscription;
  }
}
