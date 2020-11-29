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
import {
  TranslateRowByIdDto,
  TranslateRowByIdHandleDto,
} from './dto/translated-row-by-id.dto';
import { LocalesService } from 'src/locales/locales.service';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GetTranslatedRowDto } from './dto/get-translated-row.dto';
import { ServiceProviderService } from 'src/service-provider/service-provider.service';
import { IServiceProvider } from 'src/service-provider/interfaces/service-provider.interface';

@Injectable()
export class TranslatorService {
  constructor(
    @InjectModel('Key') private readonly keyModel: Model<IKey>,
    private readonly fileService: FileService,
    private httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly keysMeta: KeysmetaService,
    private readonly localesService: LocalesService,
    private readonly serviceProviderService: ServiceProviderService,
  ) {}

  private buildJsonFromFile(lang, project): ITranslateJson {
    const path = this.fileService.checkСonditions(project);
    const file = readFileSync(resolve(path, `${lang}.js`), 'utf8');
    const parsedFile = this.keysMeta.realiseEval(file, lang);

    return parsedFile;
  }

  private readonly myMemoryTranslate = async url => {
    let translate;
    try {
      translate = await this.httpService
        .get(url)
        .pipe(map(async response => await response.data))
        .toPromise();
      return translate.responseData.translatedText;
    } catch (error) {
      console.log(error);
    }
  };

  private readonly webtranTranslate = async ({
    from,
    to,
    text,
    url,
    token,
  }) => {
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
      return translate;
    } catch (error) {
      console.log(`Error:${error}`);
    }
  };

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
          serviceId: translateAllKeys.serviceId,
        });
      }
      console.log('Done!');
    };
    processArray(arrOfKeysIds);

    return arrOfKeysIds;
  }

  async getTranslateById(query: GetTranslatedRowDto): Promise<IKey> {
    const { Id, lang } = query;
    const key = await this.keysMeta.getKeyByid({ Id });
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

  async translateString({ from, to, text }, service: IServiceProvider) {
    let translatedString;
    switch (service.name) {
      case 'webtran':
        const webtranPayload = {
          from,
          to,
          text,
          ...(service.url && { url: service.url }),
          ...(service.token.secretKey && { token: service.token.secretKey }),
        };
        await this.webtranTranslate(webtranPayload).then(
          tr => (translatedString = tr),
        );
        break;
      case 'MyMemory':
        const parseText = from === 'ru' ? encodeURIComponent(text) : text;
        const query = `?q=${parseText}&langpair=${from}|${to}`;
        const myMemoryPayload = `${service.url}${query}`;
        await this.myMemoryTranslate(myMemoryPayload).then(
          tr => (translatedString = tr),
        );
        break;
    }

    return translatedString;
  }

  async translateKeyById(translatdRowById: TranslateRowByIdDto): Promise<IKey> {
    const { Id, lang, project, serviceId } = translatdRowById;

    const isLangExist = await this.localesService.checkLocaleExist(lang);
    if (!isLangExist) {
      throw new Error(`that locales doest exist`);
    }

    const service = await this.serviceProviderService.getById({
      ID: serviceId,
    });
    // TODO:  Для перевода всех строк сервис надо закешировать что бы на каждую итерацию не бегать в базу

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

    const translate = await this.translateString(payload, service);

    const translator: ITranslatedInTo['translator'] = {
      name: service.name,
      role: 'machine',
    };

    const arr = curKey.translatedInTo.map(k => {
      if (k.lang === lang) {
        return { ...k, translator, translate };
      }
      return k;
    });

    const keyWithNewTranslate = await this.keyModel.findByIdAndUpdate(
      Id,
      {
        $set: { translatedInTo: arr },
      },
      { new: true },
    );
    return keyWithNewTranslate;
  }

  async translateKeyByIdHandle(
    translateRowById: TranslateRowByIdHandleDto,
  ): Promise<IKey> {
    const { Id, lang, handleTranslate } = translateRowById;

    const isLangExist = await this.localesService.checkLocaleExist(lang);
    if (!isLangExist) {
      throw new Error(`that locales doest exist`);
    }

    const curKey = await this.keyModel
      .findById(Id)
      .lean()
      .exec();

    const translate = handleTranslate;
    const translator = {
      name: 'some one',
      role: 'User',
    };

    const newTranslatedInTo = curKey.translatedInTo.map(k => {
      if (k.lang === lang) {
        return { ...k, translator, translate };
      }
      return k;
    });

    const keyWithNewTranslate = await this.keyModel.findByIdAndUpdate(
      Id,
      {
        $set: { translatedInTo: newTranslatedInTo },
      },
      { new: true },
    );
    return keyWithNewTranslate;
  }
}
