import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { extensionEnum } from '../enums/extensions.enum';

export class GetFileDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of project',
  })
  project: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Language which one you need',
  })
  lang: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'extension of building file ',
  })
  extension: extensionEnum;
}
