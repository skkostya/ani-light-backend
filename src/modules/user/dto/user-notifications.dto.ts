import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserNotificationsDto {
  @IsOptional()
  @IsBoolean()
  notifications_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications_telegram_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications_email_enabled?: boolean;
}

export class UserNotificationsResponseDto {
  notifications_enabled: boolean;
  notifications_telegram_enabled: boolean;
  notifications_email_enabled: boolean;
}
