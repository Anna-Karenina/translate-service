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

@Injectable()
export class TranslatorService {
  constructor(
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

  async getAllRows(translateAllKeys: TranslateAllKeys): Promise<any> {
    const { lang, project } = translateAllKeys;
    const keysMeta = await this.keysMeta.getKeysMeta({ project });
    const keysMetaObject: IKeysMeta = keysMeta.toObject(); //mongoose возвращает монгус документ
    const onlyKeysFromBd = this.buildJsonFromFile(lang, project);

    return {
      ...keysMetaObject,
      keys: keysMetaObject.keys.reduce((acc, key) => {
        const newTr = key.translatedInTo.map(tr =>
          tr.lang === lang
            ? { ...tr, translate: onlyKeysFromBd[key.name] }
            : tr,
        );
        //@ts-ignore
        key = { ...key, translatedInTo: newTr };
        return [...acc, key];
      }, []),
    };
  }

  async getTranslateById(query: GetTranslatedRowByIdDto): Promise<IKey> {
    const { Id, lang } = query;
    const key = await this.keysMeta.getKeyByid(Id);
    if (!lang) {
      return key;
    } else {
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
  ): Promise<IKey | INotifications> {
    const { Id, lang, project } = translatedRowById;
    const url = this.configService.get<string>('TRANSLATE_SERVICE');

    const isLangExist = await this.localesService.checkLocaleExist(lang);
    if (!isLangExist) {
      return { status: 0, message: `that locales doest exist` };
    }
    const key = await this.keysMeta.getKeyByid(Id);
    if (!key) return { status: 0, message: `key with ID: ${Id} not founded` };

    const {
      lang: truthfullang,
      translate: truthfultranslate,
    } = key.translatedInTo.find(k => k.truthful === true);

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

    const updatedTranslatedInTo = key.translatedInTo.map(k => {
      if (k.lang === lang) {
        return {
          ...k,
          translator,
          translate: translate,
        };
      } else return k;
    });

    const newKey: any = { ...key, translatedInTo: updatedTranslatedInTo };
    this.keysMeta.updateKeyById(newKey, project);
    return;
  }
}
