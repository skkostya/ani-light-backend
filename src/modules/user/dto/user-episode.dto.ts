import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { EpisodeWatchStatus } from '../entities/user-episode.entity';

export class CreateUserEpisodeDto {
  @IsUUID()
  episode_id: string;

  @IsOptional()
  @IsEnum(EpisodeWatchStatus)
  status?: EpisodeWatchStatus;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating?: number;
}

export class UpdateUserEpisodeDto {
  @IsOptional()
  @IsEnum(EpisodeWatchStatus)
  status?: EpisodeWatchStatus;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating?: number;
}

export class MarkEpisodeWatchedDto {
  @IsOptional()
  @IsBoolean()
  watched_until_end?: boolean;
}

export class UserEpisodeResponseDto {
  id: string;
  user_id: string;
  episode_id: string;
  status: EpisodeWatchStatus;
  last_watched_at?: Date;
  watched_until_end_at?: Date;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}
