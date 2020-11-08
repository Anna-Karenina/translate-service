import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { FileService } from 'src/file/file.service';
import { INotifications } from 'src/global-interfaces/notifications.interface';
import { GetFileDto } from './dto/get-file.dto';
import { GetKeysDto } from './dto/get-keys.dto';
import { BuildKeysDto } from './dto/keysmeta.dto';
import { IKeysMeta } from './interfaces/keysmeta.interface';
import { KeysmetaService } from './keysmeta.service';
import { Response } from 'express';

@ApiTags('KeysMeta')
@Controller('keysmeta')
export class KeysmetaController {
  constructor(
    private readonly keysService: KeysmetaService,
    private readonly fileService: FileService,
  ) {}

  @Post('/build-keys')
  async buildKeys(
    @Query(ValidationPipe) query: BuildKeysDto,
  ): Promise<IKeysMeta | INotifications> {
    return await this.keysService.buildKeys(query);
  }

  @Get('/get-keys')
  async getKeys(
    @Query(ValidationPipe) getKeysDto: GetKeysDto,
  ): Promise<IKeysMeta> {
    return await this.keysService.getKeysMeta(getKeysDto);
  }

  @Get('get-translated-file')
  async getFile(
    @Query(ValidationPipe) getFileDto: GetFileDto,
    @Res() res: Response,
  ): Promise<any> {
    const filePath: string = await this.fileService.buildFileByProjectName(
      getFileDto,
    );

    const headers = {
      'Content-Disposition': `attachment; filename="${getFileDto.lang}.${getFileDto.extension}"`,
      'Content-Length': this.fileService.getFilesizeInBytes(filePath),
    };
    res.sendFile(filePath, { headers }, function(err) {
      if (err) {
        console.log('errrr:', err);
      } else {
        console.log('Sent:', filePath);
      }
    });
  }

  // @Post('/add-keys')
  // async addKeys(@Body(ValidationPipe), AddNewKeysDto): Promise<IKeysMeta> {
  //   return await this.keysService.buildKeys(query);
  // }
}
