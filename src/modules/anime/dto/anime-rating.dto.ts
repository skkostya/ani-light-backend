import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class CreateAnimeRatingDto {
  @IsUUID()
  anime_id: string;

  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating: number;
}

export class UpdateAnimeRatingDto {
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating: number;
}

export class AnimeRatingResponseDto {
  id: string;
  user_id: string;
  anime_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}
