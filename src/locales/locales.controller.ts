import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateLocaleDto } from './dto/create-locale.dto';
import { DeleteLocaleDto } from './dto/delete-locale.dto';
import { GetLocaleDto } from './dto/get-locale-by-name.dto';
import { ILocale } from './interfaces/locale.interface';
import { LocalesService } from './locales.service';

@ApiTags('Locales')
@Controller('locales')
export class LocalesController {
  constructor(private readonly localesService: LocalesService) {}

  @Post('/create')
  async create(
    @Body(ValidationPipe) createLocaleDto: CreateLocaleDto,
  ): Promise<ILocale> {
    return this.localesService.create(createLocaleDto); // TODO: выкинуть ошибку если не существует кейсМета в бд
  }

  @Get('/get-list')
  async getLocaleList(): Promise<ILocale[]> {
    return this.localesService.getAll();
  }
  @Get('/get-by-name')
  async getLocaleByName(
    @Query(ValidationPipe) query: GetLocaleDto,
  ): Promise<ILocale> {
    return this.localesService.getLocaleByName(query);
    // обработать ошибки
  }

  @Delete('/deete')
  async deleteLocale(
    @Query(ValidationPipe) query: DeleteLocaleDto,
  ): Promise<boolean> {
    return this.localesService.delete(query);
  }
}
