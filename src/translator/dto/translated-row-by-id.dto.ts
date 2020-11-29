import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class TranslateRowByIdDto {
  @IsNotEmpty()
  @ApiProperty()
  Id: string;

  @IsNotEmpty()
  @ApiProperty()
  lang: string;

  @IsNotEmpty()
  @ApiPropertyOptional()
  project?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Service wich use for translate',
  })
  serviceId?: string;
}

export class TranslateRowByIdHandleDto {
  @IsNotEmpty()
  @ApiProperty()
  Id: string;

  @IsNotEmpty()
  @ApiProperty()
  lang: string;

  @IsOptional()
  @ApiProperty({
    description:
      'if you dont use any translate services, write translate handle',
  })
  handleTranslate?: string;
}