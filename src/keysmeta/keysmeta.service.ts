/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GitlabService } from 'src/gitlab/gitlab.service';
import { LocalesService } from 'src/locales/locales.service';
import { GetKeysDto } from './dto/get-keys.dto';
import { BuildKeysDto } from './dto/keysmeta.dto';
import { IKey } from './interfaces/key.interfaces';
import { IKeysMeta } from './interfaces/keysmeta.interface';

@Injectable()
export class KeysmetaService {
  constructor(
    @InjectModel('KeysMeta') private readonly keysMetaModel: Model<IKeysMeta>,
    private readonly gitLabService: GitlabService,
    private readonly localesService: LocalesService,
  ) {}

  private realiseEval = (jsString: string, lang: string) => {
    const code = jsString.replace(`export const ${lang} = `, '');
    const str = `(function (){
      return ${code} })()`;
    return eval(str);
  };

  async buildKeys(buildKeysDto: BuildKeysDto): Promise<IKeysMeta> {
    const data: string = await this.gitLabService.getMainLocaleFileFromGitLab();
    const parsedData = await this.realiseEval(data, 'ru');

    const locales = await this.localesService.getAll();

    const translatedInTo: IKey['translatedInTo'] = locales.reduce(
      (acc, loc) => {
        const a = {
          lang: loc.name,
          translator: { name: 'unkwnow', id: 0 },
        };
        return [...acc, a];
      },
      [],
    );

    const keys = Object.keys(parsedData).reduce((acc, key: string):
      | IKeysMeta['keys']
      | [] => {
      const a = {
        name: key,
        translatedInTo,
      };
      //@ts-ignore
      return [...acc, a];
    }, []);

    const newKeysMeta: IKeysMeta = {
      //@ts-ignore
      keys,
      length: keys.length,
      project: buildKeysDto.project,
    };

    const saveKeys = new this.keysMetaModel(newKeysMeta);
    const k = await saveKeys.save();

    return k;
  }

  async getKeysMeta(getKeysDto: GetKeysDto): Promise<IKeysMeta> {
    const keys = await this.keysMetaModel.findOne(getKeysDto);
    return keys;
  }
}
