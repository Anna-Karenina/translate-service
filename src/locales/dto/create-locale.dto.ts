import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateLocaleDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'name of locale',
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: "short cut like 'us-EN' format",
  })
  shortCut: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of projects',
  })
  project: string;
}
