/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GitlabService } from 'src/gitlab/gitlab.service';
import { INotifications } from 'src/global-interfaces/notifications.interface';
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

  realiseEval = (jsString: string, lang: string) => {
    const code = jsString.replace(`export const ${lang} = `, '');
    const str = `(function (){
      return ${code} })()`;
    return eval(str);
  };

  async checkIsProjectExist(project: string): Promise<boolean> {
    return await this.keysMetaModel.exists({ project });
  }

  async buildKeys(
    buildKeysDto: BuildKeysDto,
  ): Promise<IKeysMeta | INotifications> {
    const { project } = buildKeysDto;
    const IsProjectExist = await this.checkIsProjectExist(project);
    if (IsProjectExist)
      return { status: 1, message: `project ${project} all ready existing ` };

    const data: string = await this.gitLabService.getMainLocaleFileFromGitLab();
    const parsedData = await this.realiseEval(data, 'ru');

    // const locales = await this.localesService.getAll();
    // const translatedInTo: IKey['translatedInTo'] = locales.reduce(
    //   (acc, loc) => {
    //     const payload = {
    //       lang: loc.name,
    //       translator: { name: 'unkwnow', id: 0 },
    //       translate: '',
    //     };
    //     return [...acc, payload];
    //   },
    //   [],
    // );

    const keys = Object.keys(parsedData).reduce((acc, key: string):
      | IKeysMeta['keys']
      | [] => {
      const a = {
        name: key,
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
    await saveKeys.save();

    return {
      status: 1,
      message: `Keys-Meta for project ${project} successed created`,
    };
  }

  async getKeysMeta(getKeysDto: GetKeysDto): Promise<IKeysMeta> {
    const keys = await this.keysMetaModel.findOne(getKeysDto);
    return keys;
  }

  async getKeyByid(Id: string): Promise<IKey> {
    let keysMeta = await this.getKeysMeta(null);
    keysMeta = keysMeta.toObject();
    const { keys } = keysMeta;
    return keys.find(k => k._id.toString() === Id);
  }

  async updateKeyById(newKey: IKey, project: string): Promise<IKey> {
    let newKeys = [];
    const mongoKeys = await this.keysMetaModel.findOne({ project }).exec();
    newKeys = mongoKeys.keys.reduce((acc, key) => {
      const oldKeyId = key._id.toString();
      const newKeyId = newKey._id.toString();
      return newKeyId === oldKeyId ? [...acc, { ...newKey }] : [...acc, key];
    }, []);

    await this.keysMetaModel.findOneAndUpdate(
      { project },
      //@ts-ignore
      { $set: { keys: newKeys } },
      { new: true },
      err => {
        console.log(err);
      },
    );
    return newKey;
  }
}
