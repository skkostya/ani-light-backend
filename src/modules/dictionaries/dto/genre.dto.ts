import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({
    description: 'ID жанра из внешней системы (AniLibria API)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  external_id: number;

  @ApiProperty({
    description: 'Название жанра',
    example: 'Экшен',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Изображения жанра',
    type: 'object',
    properties: {
      optimized_preview: {
        type: 'string',
        example: 'https://example.com/preview.jpg',
        description: 'Оптимизированное превью изображения',
      },
      preview: {
        type: 'string',
        example: 'https://example.com/full.jpg',
        description: 'Полное изображение',
      },
    },
  })
  @IsObject()
  @IsNotEmpty()
  image: {
    optimized_preview: string;
    preview: string;
  };
}

export class UpdateGenreDto {
  @ApiPropertyOptional({
    description: 'ID жанра из внешней системы',
    example: 1,
  })
  @IsNumber()
  external_id?: number;

  @ApiPropertyOptional({
    description: 'Название жанра',
    example: 'Экшен',
  })
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Изображения жанра',
    type: 'object',
    properties: {
      optimized_preview: {
        type: 'string',
        example: 'https://example.com/preview.jpg',
        description: 'Оптимизированное превью изображения',
      },
      preview: {
        type: 'string',
        example: 'https://example.com/full.jpg',
        description: 'Полное изображение',
      },
    },
  })
  @IsObject()
  image?: {
    optimized_preview: string;
    preview: string;
  };
}

export class GenreResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор жанра',
    example: 'uuid-genre-id',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID жанра из внешней системы',
    example: 1,
  })
  external_id: number;

  @ApiProperty({
    description: 'Название жанра',
    example: 'Экшен',
  })
  name: string;

  @ApiProperty({
    description: 'Изображения жанра',
    type: 'object',
    properties: {
      optimized_preview: {
        type: 'string',
        example: 'https://example.com/preview.jpg',
        description: 'Оптимизированное превью изображения',
      },
      preview: {
        type: 'string',
        example: 'https://example.com/full.jpg',
        description: 'Полное изображение',
      },
    },
  })
  image: {
    optimized_preview: string;
    preview: string;
  };
}
