import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class CreateEpisodeRatingDto {
  @IsUUID()
  episode_id: string;

  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating: number;
}

export class UpdateEpisodeRatingDto {
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating: number;
}

export class EpisodeRatingResponseDto {
  id: string;
  user_id: string;
  episode_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}
