import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BuildKeysDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of project',
  })
  project: string;
}
