import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class GetEpisodesDto {
  @ApiProperty({
    description: 'ID аниме для получения эпизодов',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'animeId должен быть валидным UUID' })
  animeId: string;
}

export class GetEpisodeByNumberDto {
  @ApiProperty({
    description: 'alias аниме',
    example: 're-zero',
  })
  @IsString({ message: 'alias должен быть строкой' })
  @IsNotEmpty({ message: 'alias не может быть пустым' })
  alias: string;

  @ApiProperty({
    description: 'Номер сезона',
    example: 1,
    type: 'number',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Номер сезона должен быть числом' })
  @Min(1, { message: 'Номер сезона должен быть больше 0' })
  seasonNumber: number;

  @ApiProperty({
    description: 'Номер эпизода',
    example: 1,
    type: 'number',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Номер эпизода должен быть числом' })
  @Min(1, { message: 'Номер эпизода должен быть больше 0' })
  number: number;
}
