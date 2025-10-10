import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetEpisodesDto {
  @ApiProperty({
    description: 'ID аниме для получения эпизодов',
    example: 'uuid-anime-id',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'animeId должен быть валидным UUID' })
  animeId: string;
}
