import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateUserAnimeDto {
  @IsUUID()
  anime_id: string;

  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @IsOptional()
  @IsBoolean()
  want_to_watch?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications_telegram?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications_email?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating?: number;
}

export class UpdateUserAnimeDto {
  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @IsOptional()
  @IsBoolean()
  want_to_watch?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications_telegram?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications_email?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating?: number;
}

export class UserAnimeResponseDto {
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
