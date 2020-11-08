import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AllTranslatedRows {
  @IsNotEmpty()
  @ApiProperty({
    description: 'arr of keys',
  })
  keys: string[];

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
