import { IsUUID } from 'class-validator';

export class UuidParamDto {
  @IsUUID(4, { message: 'ID должен быть валидным UUID' })
  id: string;
}
