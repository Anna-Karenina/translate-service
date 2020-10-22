import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TranslateInToFileDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'arr of keys',
  })
  keys: string[];
}
