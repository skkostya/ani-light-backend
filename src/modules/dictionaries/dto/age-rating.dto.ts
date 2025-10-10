import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAgeRatingDto {
  @ApiProperty({
    description:
      'Значение возрастного рейтинга (R0_PLUS, R6_PLUS, R12_PLUS, R16_PLUS, R18_PLUS)',
    example: 'R12_PLUS',
    enum: ['R0_PLUS', 'R6_PLUS', 'R12_PLUS', 'R16_PLUS', 'R18_PLUS'],
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Отображаемая метка возрастного рейтинга',
    example: '12+',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Описание возрастного рейтинга',
    example: 'Для детей старше 12 лет',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateAgeRatingDto {
  @ApiPropertyOptional({
    description: 'Значение возрастного рейтинга',
    example: 'R12_PLUS',
    enum: ['R0_PLUS', 'R6_PLUS', 'R12_PLUS', 'R16_PLUS', 'R18_PLUS'],
  })
  @IsString()
  value?: string;

  @ApiPropertyOptional({
    description: 'Отображаемая метка возрастного рейтинга',
    example: '12+',
  })
  @IsString()
  label?: string;

  @ApiPropertyOptional({
    description: 'Описание возрастного рейтинга',
    example: 'Для детей старше 12 лет',
  })
  @IsString()
  description?: string;
}

export class AgeRatingResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор возрастного рейтинга',
    example: 'uuid-age-rating-id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Значение возрастного рейтинга',
    example: 'R12_PLUS',
    enum: ['R0_PLUS', 'R6_PLUS', 'R12_PLUS', 'R16_PLUS', 'R18_PLUS'],
  })
  value: string;

  @ApiProperty({
    description: 'Отображаемая метка возрастного рейтинга',
    example: '12+',
  })
  label: string;

  @ApiProperty({
    description: 'Описание возрастного рейтинга',
    example: 'Для детей старше 12 лет',
  })
  description: string;
}
