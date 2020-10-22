import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocaleDto } from './dto/create-locale.dto';
import { ILocale } from './interfaces/locale.interface';
import { Model } from 'mongoose';
import { DeleteLocaleDto } from './dto/delete-locale.dto';
import { GetLocaleDto } from './dto/get-locale-by-name.dto';
import { FileService } from 'src/file/file.service';

@Injectable()
export class LocalesService {
  constructor(
    @InjectModel('Locale') readonly localeModel: Model<ILocale>,
    private readonly fileService: FileService,
  ) {}

  async create(createLocaleDto: CreateLocaleDto): Promise<ILocale> {
    const locale = new this.localeModel(createLocaleDto);
    this.fileService.buildLocaleFileWithEmptyStrings(createLocaleDto);
    return await locale.save();
  }

  async getAll(): Promise<ILocale[]> {
    const locales = await this.localeModel.find();
    return locales;
  }

  async getLocaleByName(getLocaleDto: GetLocaleDto): Promise<ILocale> {
    const locale = await this.localeModel.findOne(getLocaleDto);
    if (locale) {
      return locale;
    }
    throw new BadRequestException(`${getLocaleDto.name} does not find`);
    // TODO Обработку ошибки
  }

  async delete(deleteLocaleDto: DeleteLocaleDto): Promise<boolean> {
    await this.localeModel.findOneAndDelete(deleteLocaleDto);
    return true;
  }
}
