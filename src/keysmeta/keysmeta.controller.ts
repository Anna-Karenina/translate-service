import { Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { GetKeysDto } from './dto/get-keys.dto';
import { BuildKeysDto } from './dto/keysmeta.dto';
import { IKeysMeta } from './interfaces/keysmeta.interface';
import { KeysmetaService } from './keysmeta.service';

@ApiTags('KeysMeta')
@Controller('keysmeta')
export class KeysmetaController {
  constructor(private readonly keysService: KeysmetaService) {}

  @Post('/build-keys')
  async buildKeys(
    @Query(ValidationPipe) query: BuildKeysDto,
  ): Promise<IKeysMeta> {
    return await this.keysService.buildKeys(query);
  }

  @Get('/get-keys')
  async getKeys(
    @Query(ValidationPipe) getKeysDto: GetKeysDto,
  ): Promise<IKeysMeta> {
    return await this.keysService.getKeysMeta(getKeysDto);
  }

  // @Post('/add-keys')
  // async addKeys(@Body(ValidationPipe), AddNewKeysDto): Promise<IKeysMeta> {
  //   return await this.keysService.buildKeys(query);
  // }
}
