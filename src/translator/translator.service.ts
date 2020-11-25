/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpService, Injectable } from '@nestjs/common';
import { KeysmetaService } from 'src/keysmeta/keysmeta.service';
import { TranslateAllKeys } from './dto/translate-all-keys.dto';
import { readFileSync } from 'fs';
import { ITranslateJson } from './interfaces/translate-json.interface';
import { FileService } from 'src/file/file.service';
import { resolve } from 'path';
import { IKeysMeta } from 'src/keysmeta/interfaces/keysmeta.interface';
import { IKey, ITranslatedInTo } from 'src/keysmeta/interfaces/key.interfaces';
import { GetTranslatedRowByIdDto } from './dto/get-translated-row-by-id.dto';
import { INotifications } from 'src/global-interfaces/notifications.interface';
import { LocalesService } from 'src/locales/locales.service';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TranslatorService {
  constructor(
    @InjectModel('Key') private readonly keyModel: Model<IKey>,
    private readonly fileService: FileService,
    private httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly keysMeta: KeysmetaService,
    private readonly localesService: LocalesService,
  ) {}

  private buildJsonFromFile(lang, project): ITranslateJson {
    const path = this.fileService.checkСonditions(project);
    const file = readFileSync(resolve(path, `${lang}.js`), 'utf8');
    const parsedFile = this.keysMeta.realiseEval(file, lang);

    return parsedFile;
  }

  async tryTranslateAllKeys(translateAllKeys: TranslateAllKeys) {
    const curKeysMeta = await this.keysMeta.getKeysMeta({
      project: translateAllKeys.project,
      consumer: translateAllKeys.consumer,
    });
    //@ts-ignore
    const arrOfKeysIds = curKeysMeta.keys.reduce((acc, key) => {
      return [...acc, key.key];
    }, []);

    const processArray = async array => {
      for (const item of array) {
        await this.translateKeyById({
          Id: item,
          project: translateAllKeys.project,
          lang: translateAllKeys.lang,
        });
      }
      console.log('Done!');
    };
    processArray(arrOfKeysIds);

    return arrOfKeysIds;
  }

  async getTranslateById(query: GetTranslatedRowByIdDto): Promise<IKey> {
    const { Id, lang } = query;
    const key = await this.keysMeta.getKeyByid(Id);
    if (!lang) {
      //@ts-ignore
      return key;
    } else {
      //@ts-ignore
      const keyFilteredByLang = key.translatedInTo.map(tr =>
        tr.lang === lang ? tr : null,
      );
      //@ts-ignore
      return { ...key, translatedInTo: keyFilteredByLang }; // TODO: выкинуть ошибку что нету по такому языку
    }
  }

  async translateString({ from, to, text }) {
    const url = this.configService.get<string>('TRANSLATE_SERVICE');
    const token = this.configService.get<string>('TRANSLATE_SERVICE_KEY');

    const payload = {
      text: text,
      gfrom: from,
      gto: to,
      key: token,
    };

    const data = Object.entries(payload)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join('&');

    let translate: string;
    try {
      translate = await this.httpService
        .post(url, data)
        .pipe(map(async response => await response.data))
        .toPromise();
      console.log(translate);
    } catch (error) {
      console.log(`Error:${error}`);
    }

    return translate;
  }

  async translateKeyById(
    translatedRowById: GetTranslatedRowByIdDto,
  ): Promise<IKey | INotifications | any> {
    const { Id, lang } = translatedRowById;
    const url = this.configService.get<string>('TRANSLATE_SERVICE');
    const isLangExist = await this.localesService.checkLocaleExist(lang);
    if (!isLangExist) {
      return { status: 0, message: `that locales doest exist` };
    }

    const curKey = await this.keyModel
      .findById(Id)
      .lean()
      .exec();

    const {
      lang: truthfullang,
      translate: truthfultranslate,
    } = curKey.translatedInTo.find(k => k.truthful === true);

    const payload = {
      from: truthfullang,
      to: lang,
      text: truthfultranslate,
    };
    const translate = await this.translateString(payload);

    const translator: ITranslatedInTo['translator'] = {
      name: url,
      role: 'machine',
    };

    const arr = curKey.translatedInTo.map(k => {
      if (k.lang === lang) {
        return { ...k, translator, translate };
      }
      return k;
    });

    const keyWithNewTranslate = await this.keyModel.findByIdAndUpdate(Id, {
      $set: { translatedInTo: arr },
    });
    return keyWithNewTranslate;
  }
}
