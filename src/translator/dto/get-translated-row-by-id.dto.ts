import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetTranslatedRowByIdDto {
  @IsNotEmpty()
  @ApiProperty()
  Id: string;

  @IsNotEmpty()
  @ApiProperty()
  lang: string;

  @IsNotEmpty()
  @ApiProperty()
  project?: string;
}
