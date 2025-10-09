import { IsUUID } from 'class-validator';

export class GetEpisodesDto {
  @IsUUID(4, { message: 'animeId должен быть валидным UUID' })
  animeId: string;
}
