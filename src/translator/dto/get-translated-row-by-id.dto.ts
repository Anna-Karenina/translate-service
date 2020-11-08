import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetTranslatedRowByIdDto {
  @IsNotEmpty()
  @ApiProperty()
  Id: string;

  @ApiProperty()
  lang: string;

  @ApiProperty()
  project?: string;
}
