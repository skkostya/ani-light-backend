import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UuidParamDto {
  @IsUUID(4, { message: 'ID должен быть валидным UUID' })
  id: string;
}

export class AliasParamDto {
  @IsString({ message: 'Alias должен быть строкой' })
  @IsNotEmpty({ message: 'Alias не может быть пустым' })
  idOrAlias: string;
}
