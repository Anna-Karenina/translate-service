import {
  Body,
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
import { GetKeyDto, GetKeysDto } from './dto/get-keys.dto';
import { BuildKeysDto } from './dto/keysmeta.dto';
import { IKeysMeta } from './interfaces/keysmeta.interface';
import { KeysmetaService } from './keysmeta.service';
import { query, Response } from 'express';
import { IKey } from './interfaces/key.interfaces';
import { IProject } from './interfaces/project.interface';
import { UpdateKeysDto } from './dto/update-keys.dto';
import { UpdateKeyDto } from './dto/add-key.dto';

@ApiTags('KeysMeta')
@Controller('keysmeta')
export class KeysmetaController {
  constructor(
    private readonly keysService: KeysmetaService,
    private readonly fileService: FileService,
  ) {}

  @Post('/build-keys')
  async buildKeys(
    @Body(ValidationPipe) buildKeysDto: BuildKeysDto,
  ): Promise<IKeysMeta | INotifications> {
    const keyOrNotice = await this.keysService.buildKeys(buildKeysDto);
    return keyOrNotice;
  }

  @Post('/update-keys')
  async updateKeys(
    @Body(ValidationPipe) updateKeysDto: UpdateKeysDto,
  ): Promise<INotifications> {
    const res = await this.keysService.updateKeys(updateKeysDto);
    return res;
  }

  @Get('/project-with-consumer')
  async getProjectWConsumer(): Promise<IProject[] | INotifications> {
    const res = await this.keysService.getProjecstWithConsumer();
    return res;
  }

  @Get('/get-keys')
  async getKeys(
    @Query(ValidationPipe) getKeysDto: GetKeysDto,
  ): Promise<IKeysMeta | INotifications> {
    const res = await this.keysService.getFilledKeysMeta(getKeysDto);
    return res;
  }

  @Get('/get-key-by-id')
  async getKeyById(
    @Query(ValidationPipe) query: GetKeyDto,
  ): Promise<IKey | INotifications> {
    const res = await this.keysService.getKeyByid(query);
    return res;
  }

  @Post('/create-or-update-key')
  async addKey(
    @Body(ValidationPipe) updateKeyDto: UpdateKeyDto,
  ): Promise<IKey> {
    const key = this.keysService.updateOrCreateKey(updateKeyDto);
    return key;
  }
  // @Get('get-translated-file')
  // async getFile(
  //   @Query(ValidationPipe) getFileDto: GetFileDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   const filePath: string = await this.fileService.buildFileByProjectName(
  //     getFileDto,
  //   );

  //   const headers = {
  //     'Content-Disposition': `attachment; filename="${getFileDto.lang}.${getFileDto.extension}"`,
  //     'Content-Length': this.fileService.getFilesizeInBytes(filePath),
  //   };
  //   res.sendFile(filePath, { headers }, function(err) {
  //     if (err) {
  //       console.log('errrr:', err);
  //     } else {
  //       console.log('Sent:', filePath);
  //     }
  //   });
  // }

  // @Post('/add-keys')
  // async addKeys(@Body(ValidationPipe), AddNewKeysDto): Promise<IKeysMeta> {
  //   return await this.keysService.buildKeys(query);
  // }
}
