import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddServiceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the service',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Url of api',
  })
  url: string;

  @IsOptional()
  @ApiProperty({
    description: '',
  })
  secret_key?: string;

  @IsOptional()
  @ApiProperty({
    description: '',
  })
  secretKeyExpireAt?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '',
  })
  formatGroup: string;
}
