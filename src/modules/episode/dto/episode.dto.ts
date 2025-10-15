import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Min } from 'class-validator';

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
    description: 'ID аниме',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'animeId должен быть валидным UUID' })
  animeId: string;

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
