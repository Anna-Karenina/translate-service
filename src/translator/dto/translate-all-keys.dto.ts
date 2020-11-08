import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TranslateAllKeys {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Lang than need to translate',
  })
  lang: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Project that uses in this translate',
  })
  project: string;
}
