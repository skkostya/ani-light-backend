import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserNotificationsDto {
  @ApiPropertyOptional({
    description: 'Включить общие уведомления',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifications_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Включить уведомления в Telegram',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifications_telegram_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Включить уведомления по email',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  notifications_email_enabled?: boolean;
}

export class UserNotificationsResponseDto {
  @ApiProperty({
    description: 'Включены ли общие уведомления',
    example: true,
  })
  notifications_enabled: boolean;

  @ApiProperty({
    description: 'Включены ли уведомления в Telegram',
    example: true,
  })
  notifications_telegram_enabled: boolean;

  @ApiProperty({
    description: 'Включены ли уведомления по email',
    example: false,
  })
  notifications_email_enabled: boolean;
}
