import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeTelegramTokenDto {
  @ApiProperty({
    description: 'Временный токен, полученный из Telegram Mini App/бота',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  temp_token: string;
}
