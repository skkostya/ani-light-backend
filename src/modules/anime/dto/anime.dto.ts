import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetAnimeListDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SearchDto {
  @IsString()
  q: string;
}

export class CreateAnimeDto {
  @IsOptional()
  @IsNumber()
  external_id?: number;

  @IsString()
  title_ru: string;

  @IsString()
  title_en: string;

  @IsString()
  description: string;

  @IsNumber()
  year: number;

  @IsString()
  poster_url: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsBoolean()
  is_blocked_by_geo?: boolean;

  @IsOptional()
  @IsBoolean()
  is_ongoing?: boolean;

  @IsOptional()
  @IsObject()
  publish_day?: {
    value: number;
    description: string;
  };

  @IsOptional()
  @IsNumber()
  episodes_total?: number;

  @IsOptional()
  @IsNumber()
  average_duration_of_episode?: number;

  @IsOptional()
  @IsDateString()
  external_created_at?: string;

  @IsOptional()
  @IsString()
  age_rating_id?: string;

  @IsOptional()
  @IsString({ each: true })
  genre_ids?: string[];
}

export class UpdateAnimeDto {
  @IsOptional()
  @IsString()
  title_ru?: string;

  @IsOptional()
  @IsString()
  title_en?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  poster_url?: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsBoolean()
  is_blocked_by_geo?: boolean;

  @IsOptional()
  @IsBoolean()
  is_ongoing?: boolean;

  @IsOptional()
  @IsObject()
  publish_day?: {
    value: number;
    description: string;
  };

  @IsOptional()
  @IsNumber()
  episodes_total?: number;

  @IsOptional()
  @IsNumber()
  average_duration_of_episode?: number;

  @IsOptional()
  @IsDateString()
  external_created_at?: string;

  @IsOptional()
  @IsString()
  age_rating_id?: string;

  @IsOptional()
  @IsString({ each: true })
  genre_ids?: string[];
}
