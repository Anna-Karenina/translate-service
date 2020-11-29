import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { consumersEnum } from '../enums/consumers.enum';

export class UpdateKeyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the key',
  })
  keyName: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Id of the key if need update',
  })
  ID?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Truthful locale translate',
  })
  truthfulLocaleTranslate: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Project wich that locale add',
  })
  project: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Consumer wich that locale add',
  })
  consumer: consumersEnum;
}
