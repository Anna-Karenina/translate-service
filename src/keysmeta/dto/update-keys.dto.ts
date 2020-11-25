import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { consumersEnum } from '../enums/consumers.enum';

export class UpdateKeysDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of project',
  })
  project: string;

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
  linkToRepo?: string;
}
