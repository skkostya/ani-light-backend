import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

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
