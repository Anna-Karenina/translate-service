import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { extensionEnum } from '../enums/extensions.enum';

export class BuildKeysDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of project',
  })
  project: string;

  @IsNotEmpty()
  @ApiProperty({
    description: `Supports only ${Object.keys(extensionEnum)}`,
  })
  extension: string;
}
