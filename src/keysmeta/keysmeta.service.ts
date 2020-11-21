/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GitlabService } from 'src/gitlab/gitlab.service';
import { INotifications } from 'src/global-interfaces/notifications.interface';
import { GetKeysDto } from './dto/get-keys.dto';
import { BuildKeysDto } from './dto/keysmeta.dto';
import { IKey } from './interfaces/key.interfaces';
import { IKeysMeta } from './interfaces/keysmeta.interface';
import { IProject, IProjectConsumer } from './interfaces/project.interface';

@Injectable()
export class KeysmetaService {
  constructor(
    @InjectModel('KeysMeta')
    private readonly keysMetaModel: Model<IKeysMeta>,
    private readonly gitLabService: GitlabService,
    @InjectModel('Key')
    private readonly key: Model<IKey>,
    @InjectModel('Project')
    private readonly projectModel: Model<IProject>,
  ) {}

  realiseEval = (jsString: string, lang: string) => {
    const code = jsString.replace(`export const ${lang} = `, '');
    const str = `(function (){
      return ${code} })()`;
    return eval(str);
  };

  async checkIsProjectExist(buildKeysDto: BuildKeysDto): Promise<IProject> {
    const { project, consumer, linkToRepo, extension } = buildKeysDto;
    let checkedProject: IProject;
    const IsProjectExist = await this.projectModel.findOne(
      { projectName: project },
      async (error, project) => {
        if (error) return false;
        const existConsumer = project.consumers.find(
          (c: IProjectConsumer) => c.consumerType === consumer,
        );
        if (existConsumer) {
          return existConsumer;
        } else {
          const newConsumer = {
            consumerType: consumer,
            fileExtension: extension,
            linkToRepo,
          };
          const newC = [...project.consumers, newConsumer];
          //@ts-ignore
          project.consumers = newC;
          return await project.save();
        }
      },
    );
    if (IsProjectExist) {
      //check consumertype
      checkedProject = IsProjectExist;
    } else {
      checkedProject = await this.buildProject(buildKeysDto);
    }
    return checkedProject;
  }

  async buildProject(buildKeysDto: BuildKeysDto): Promise<IProject> {
    const { project, consumer, extension, linkToRepo } = buildKeysDto;
    const newProject = {
      projectName: project,
      consumers: [
        {
          consumerType: consumer,
          fileExtension: extension,
          linkToRepo,
        },
      ],
    };
    const saveNewProject = new this.projectModel(newProject);
    return await saveNewProject.save();
  }

  async buildKeys(
    buildKeysDto: BuildKeysDto,
  ): Promise<IKeysMeta | INotifications> {
    const filledProject = await this.checkIsProjectExist(buildKeysDto);

    const data: string = await this.gitLabService.getMainLocaleFileFromGitLab();
    const parsedData = await this.realiseEval(data, 'ru');

    const rowKeys = Object.keys(parsedData).reduce((acc, key: string):
      | IKeysMeta['keys']
      | [] => {
      const a = {
        name: key,
      };
      //@ts-ignore
      return [...acc, a];
    }, []);

    let newKeys = [];
    await this.key.insertMany(rowKeys).then(keys => {
      keys.map(k => {
        newKeys = [...newKeys, { key: k._id, name: k.name }];
      });
    });

    const newKeysMeta: IKeysMeta = {
      //@ts-ignore
      keys: newKeys,
      length: newKeys.length,
      project: filledProject._id,
    };

    const saveKeys = new this.keysMetaModel(newKeysMeta);
    await saveKeys.save();

    await this.projectModel.findById(
      { _id: filledProject._id },
      async (error, p) => {
        if (error) return error;
        const curConsumer = p.consumers.find(
          c => c.consumerType === buildKeysDto.consumer,
        );
        curConsumer.keysMetaId = saveKeys._id;
        await p.save();
      },
    );
    return {
      status: 1,
      message: `Keys-Meta for project ${buildKeysDto.project} successed created`,
    };
  }

  async getKeysMeta(
    getKeysDto: GetKeysDto,
  ): Promise<IKeysMeta | INotifications> {
    const project = await this.projectModel
      .findOne({ projectName: getKeysDto.project })
      .exec();

    if (!project) {
      return {
        status: 0,
        message: `Project ${getKeysDto.project}does not exist`,
      };
    }

    const curConsumer = project.consumers.find(
      (cons: IProjectConsumer) => cons.consumerType === getKeysDto.consumer,
    );
    if (!curConsumer) {
      return {
        status: 0,
        message: `Consumer ${getKeysDto.consumer} does not exist in ${getKeysDto.project} project`,
      };
    } else {
      return await this.keysMetaModel
        .findById(curConsumer.keysMetaId)
        .populate({ path: 'keys', populate: { path: 'key' } })
        .exec();
    }
  }

  async getKeyByid(q): Promise<IKey | INotifications> {
    const key = await this.key.findById(q.Id).exec();
    if (!key) {
      return {
        status: 0,
        message: `Key with ${q.id} does not exist`,
      };
    } else {
      return key;
    }
  }

  // async updateKeyById(newKey: IKey, project: string): Promise<IKey> {
  //   let newKeys = [];
  //   const mongoKeys = await this.keysMetaModel.findOne({ project }).exec();
  //   newKeys = mongoKeys.keys.reduce((acc, key) => {
  //     const oldKeyId = key._id.toString();
  //     const newKeyId = newKey._id.toString();
  //     return newKeyId === oldKeyId ? [...acc, { ...newKey }] : [...acc, key];
  //   }, []);

  //   await this.keysMetaModel.findOneAndUpdate(
  //     { project },
  //     //@ts-ignore
  //     { $set: { keys: newKeys } },
  //     { new: true },
  //     err => {
  //       console.log(err);
  //     },
  //   );
  //   return newKey;
  // }
}
