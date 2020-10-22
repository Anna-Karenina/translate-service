import { ApiProperty } from '@nestjs/swagger';

export class GetKeysDto {
  @ApiProperty({
    description: 'Name of project',
  })
  project?: string;
}
