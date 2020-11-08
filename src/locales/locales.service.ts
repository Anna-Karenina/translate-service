import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocaleDto } from './dto/create-locale.dto';
import { ILocale } from './interfaces/locale.interface';
import { Model } from 'mongoose';
import { DeleteLocaleDto } from './dto/delete-locale.dto';
import { GetLocaleDto } from './dto/get-locale-by-name.dto';
import { FileService } from 'src/file/file.service';
import { IKeysMeta } from 'src/keysmeta/interfaces/keysmeta.interface';

@Injectable()
export class LocalesService {
  constructor(
    @InjectModel('Locale') readonly localeModel: Model<ILocale>,
    @InjectModel('KeysMeta') private readonly keysMetaModel: Model<IKeysMeta>,

    private readonly fileService: FileService,
  ) {}

  async checkExistkeyMeta(): Promise<boolean> {
    return await this.keysMetaModel.exists({});
  }

  async checkLocaleExist(locale: string): Promise<boolean> {
    return await this.localeModel.exists({ name: locale });
  }

  async create(createLocaleDto: CreateLocaleDto): Promise<ILocale> {
    const isExist = await this.checkExistkeyMeta();

    const keysMeta = await this.keysMetaModel.findOne({
      project: createLocaleDto.project,
    });
    const keyMetaObj = keysMeta.toObject();
    const extension = keyMetaObj.extension;

    let truthfulDictionary;
    if (isExist) {
      const locale = new this.localeModel(createLocaleDto);
      if (locale.truthful) {
        truthfulDictionary = await this.fileService.buildTruthLocaleFile({
          lang: createLocaleDto.name,
          project: createLocaleDto.project,
          extension,
        });
      } else {
        this.fileService.buildLocaleFileWithEmptyStrings(
          createLocaleDto,
          extension,
        );
      }

      const newKeys = keyMetaObj.keys.reduce((acc, key) => {
        const translatePayload = {
          lang: createLocaleDto.name,
          translator: { name: 'unkwnow', role: 'unknow' },
          translate: locale.truthful ? truthfulDictionary[key.name] : '',
          truthful: locale.truthful,
        };
        const newkey = {
          ...key,
          translatedInTo: [...key.translatedInTo, translatePayload],
        };
        return [...acc, newkey];
      }, []);

      await this.keysMetaModel.updateOne(
        { project: createLocaleDto.project },
        { keys: newKeys },
      );
      await keysMeta.save();

      return await locale.save();
    } else {
      throw new Error('keys does not exist');
    }
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
