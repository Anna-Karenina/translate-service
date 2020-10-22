import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetLocaleDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
