import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { INotifications } from 'src/global-interfaces/notifications.interface';
import { IKey } from 'src/keysmeta/interfaces/key.interfaces';
import {
  TranslateRowByIdDto,
  TranslateRowByIdHandleDto,
} from './dto/translated-row-by-id.dto';
import { TranslateAllKeys } from './dto/translate-all-keys.dto';
import { TranslatorService } from './translator.service';
import { GetTranslatedRowDto } from './dto/get-translated-row.dto';

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
    @Query(ValidationPipe) query: GetTranslatedRowDto,
  ): Promise<IKey> {
    try {
      const key = await this.translatorService.getTranslateById(query);
      return key;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Something goes wrong`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('tanslate-all-keys')
  async translateAllKeys(
    @Body(ValidationPipe) translateAllKeys: TranslateAllKeys,
  ): Promise<any> {
    return this.translatorService.tryTranslateAllKeys(translateAllKeys);
  }

  @Post('transate-by-id')
  async translateKey(
    @Body(ValidationPipe) translateRowById: TranslateRowByIdDto,
  ): Promise<IKey | INotifications> {
    try {
      const key = await this.translatorService.translateKeyById(
        translateRowById,
      );
      return key;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Something goes wrong ${error}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('transate-by-id-handle')
  async translateKeyHandle(
    @Body(ValidationPipe) translateRowById: TranslateRowByIdHandleDto,
  ): Promise<IKey> {
    try {
      const key = await this.translatorService.translateKeyByIdHandle(
        translateRowById,
      );
      return key;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Something goes wrong ${error}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
