import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetServiceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'id of the service',
  })
  ID: string;
}
