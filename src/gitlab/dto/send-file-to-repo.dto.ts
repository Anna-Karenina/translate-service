import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { consumersEnum } from 'src/keysmeta/enums/consumers.enum';

export class SendFileToRepositoryDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Lang than need to translate',
  })
  lang: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Project that uses in this translate',
  })
  project: string;

  @IsNotEmpty()
  @ApiProperty({
    description: `Consumer who use that keys. Can be one of ${Object.keys(
      consumersEnum,
    )}`,
    enum: consumersEnum,
  })
  consumer: consumersEnum;
}
