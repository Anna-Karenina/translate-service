import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { consumersEnum } from '../enums/consumers.enum';
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
  extension: extensionEnum;

  @IsNotEmpty()
  @ApiProperty({
    description: `what consumer use this KeysFile like ${Object.keys(
      consumersEnum,
    )}`,
  })
  consumer: consumersEnum;

  @IsNotEmpty()
  @ApiProperty({
    description: 'link to file in gitlab',
  })
  linkToRepo: string;

  // @IsNotEmpty()
  // @ApiProperty({
  //   description: 'token to file in gitlab',
  // })
  // tokenToRepo: string;
}
