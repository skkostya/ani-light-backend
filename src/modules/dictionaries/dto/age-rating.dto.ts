import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAgeRatingDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateAgeRatingDto {
  @IsString()
  value?: string;

  @IsString()
  label?: string;

  @IsString()
  description?: string;
}

export class AgeRatingResponseDto {
  id: string;
  value: string;
  label: string;
  description: string;
}
