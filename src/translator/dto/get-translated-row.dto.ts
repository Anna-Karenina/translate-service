import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetTranslatedRowDto {
  @ApiProperty({
    description: 'Id of translated row',
  })
  @IsNotEmpty()
  Id: string;

  @ApiPropertyOptional({
    description: 'Lang as filter',
  })
  @IsOptional()
  lang?: string;
}
