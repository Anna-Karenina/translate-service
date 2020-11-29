
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    description: '',
  })
  secretKey?: string;

  @IsOptional()
  @ApiPropertyOptional({
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
