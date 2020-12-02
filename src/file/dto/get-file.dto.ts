import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { consumersEnum } from 'src/keysmeta/enums/consumers.enum';

export class GetFileDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of project',
  })
  project: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Consomer',
  })
  consumer: consumersEnum;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Language which one you need',
  })
  lang: string;
}
