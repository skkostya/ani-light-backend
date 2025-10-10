import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateGenreDto {
  @IsNumber()
  @IsNotEmpty()
  external_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  image: {
    optimized_preview: string;
    preview: string;
  };
}

export class UpdateGenreDto {
  @IsNumber()
  external_id?: number;

  @IsString()
  name?: string;

  @IsObject()
  image?: {
    optimized_preview: string;
    preview: string;
  };
}

export class GenreResponseDto {
  id: string;
  external_id: number;
  name: string;
  image: {
    optimized_preview: string;
    preview: string;
  };
}
