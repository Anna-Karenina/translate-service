import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { consumersEnum } from '../enums/consumers.enum';

export class GetKeysDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of project',
  })
  project: string;

  @IsNotEmpty()
  @ApiProperty({
    description: `Consumer who use that keys. Can be one of ${Object.keys(
      consumersEnum,
    )}`,
  })
  consumer: consumersEnum;
}

export class GetKeyDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of key',
  })
  Id: string;
}
