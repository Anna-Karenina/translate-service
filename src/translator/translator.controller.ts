import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { INotifications } from 'src/global-interfaces/notifications.interface';
import { IKey } from 'src/keysmeta/interfaces/key.interfaces';
import { GetTranslatedRowByIdDto } from './dto/get-translated-row-by-id.dto';
import { TranslateAllKeys } from './dto/translate-all-keys.dto';
import { TranslatorService } from './translator.service';

@ApiTags('Translator')
@Controller('translator')
export class TranslatorController {
  constructor(private readonly translatorService: TranslatorService) {}

  // @Post('get-list')
  // async getAllTranslatedRows(
  //   @Body(ValidationPipe) translateAllKeys: TranslateAllKeys,
  // ): Promise<string> {
  //   const translatedRows = await this.translatorService.getAllRows(
  //     translateAllKeys,
  //   );
  //   return JSON.stringify(translatedRows);
  // }

  @Get('get-by-id')
  async getTranslateById(
    @Query(ValidationPipe) query: GetTranslatedRowByIdDto,
  ): Promise<IKey> {
    return this.translatorService.getTranslateById(query);
  }
  // @Post('tanslate-keys')
  // async translateAllKeys(
  //   @Body(ValidationPipe) translateAllKeys: TranslateAllKeys,
  // ): Promise<any> {
  //   return this.translatorService.translateAllKeys(translateAllKeys);
  // }
  @Post('transate-by-id')
  async translateKey(
    @Body(ValidationPipe) translatedRowById: GetTranslatedRowByIdDto,
  ): Promise<IKey | INotifications> {
    return this.translatorService.translateKeyById(translatedRowById);
  }
}
