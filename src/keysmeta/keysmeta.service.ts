/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { difference } from 'lodash';
import { Model } from 'mongoose';
import { FileService } from 'src/file/file.service';
import { GitlabService } from 'src/gitlab/gitlab.service';
import { INotifications } from 'src/global-interfaces/notifications.interface';
import { LocalesService } from 'src/locales/locales.service';
import { UpdateKeyDto } from './dto/add-key.dto';
import { GetKeysDto } from './dto/get-keys.dto';
import { BuildKeysDto } from './dto/keysmeta.dto';
import { UpdateKeysDto } from './dto/update-keys.dto';
import { IKey, ITranslatedInTo } from './interfaces/key.interfaces';
import { IKeysMeta } from './interfaces/keysmeta.interface';
import { IProject, IProjectConsumer } from './interfaces/project.interface';

@Injectable()
export class KeysmetaService {
  constructor(
    @InjectModel('KeysMeta')
    private readonly keysMetaModel: Model<IKeysMeta>,
    private readonly gitLabService: GitlabService,
    private readonly fileService: FileService,
    private readonly localeService: LocalesService,
    @InjectModel('Key')
    private readonly key: Model<IKey>,
    @InjectModel('Project')
    private readonly projectModel: Model<IProject>,
  ) {}

  realiseEval = (jsString: string, lang: string) => {
    try {
      const code = jsString.replace(`export const ${lang} = `, '');
      const str = `(function (){
        return ${code} })()`;
      return eval(str);
    } catch (error) {}
  };

  async checkProjectExist({ project, consumer }): Promise<boolean> {
    if (!consumer) {
      const proj = await this.projectModel.exists({ projectName: project });
      return proj;
    }

    const curentProjects = await this.projectModel
      .find({ projectName: project })
      .exec();

    const search = [];
    curentProjects.forEach(cp => {
      cp.consumers.forEach(con => {
        if (con.consumerType === consumer) return search.push(true);
        return search.push(false);
      });
    });
    return search.some(s => s === true);
  }

  async getFilledProject({ project, consumer }): Promise<IProject[]> {
    const curentProjects = await this.projectModel
      .find({
        projectName: project,
      })
      .exec();
    if (!consumer) return curentProjects;

    const filtered = [];
    curentProjects.forEach((cp: IProject) => {
      const findedConsumers = cp.consumers.find(
        c => c.consumerType === consumer,
      );
      if (!findedConsumers) return;
      //@ts-ignores
      const filteredConsumers = { ...cp._doc, consumers: [findedConsumers] };
      filtered.push(filteredConsumers);
    });
    return filtered;
  }

  async findOrCreateProject(buildKeysDto: BuildKeysDto): Promise<IProject> {
    const {
      project,
      consumer,
      linkToRepo,
      extension,
      langInRepo,
    } = buildKeysDto;
    let checkedProject: IProject;
    const curProject = await this.projectModel.findOne(
      { projectName: project },
      async (error, project) => {
        if (error) return false;
        if (!project) return false;
        const existConsumer = project.consumers.find(
          (c: IProjectConsumer) => c.consumerType === consumer,
        );
        if (existConsumer) {
          return existConsumer;
        } else {
          const newConsumer = {
            consumerType: consumer,
            fileExtension: extension,
            truthfulLocale: langInRepo,
            linkToRepo,
          };
          const newC = [...project.consumers, newConsumer];
          //@ts-ignore
          project.consumers = newC;
          return await project.save();
        }
      },
    );
    if (curProject) {
      //check consumertype
      checkedProject = curProject;
    } else {
      checkedProject = await this.buildProject(buildKeysDto);
    }
    return checkedProject;
  }

  async buildProject(buildKeysDto: BuildKeysDto): Promise<IProject> {
    const {
      project,
      consumer,
      extension,
      linkToRepo,
      langInRepo,
    } = buildKeysDto;
    const newProject = {
      projectName: project,
      consumers: [
        {
          consumerType: consumer,
          fileExtension: extension,
          truthfulLocale: langInRepo,
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
    const filledProject = await this.findOrCreateProject(buildKeysDto);

    const isLangExist = await this.localeService.checkLocaleExist(
      buildKeysDto.langInRepo,
    );

    const lang = isLangExist
      ? await this.localeService.getLocaleByName({
          name: buildKeysDto.langInRepo,
        })
      : await this.localeService.createDefault({
          name: buildKeysDto.langInRepo,
          project: filledProject._id,
          shortCut: '',
          truthful: true,
        });

    const existLocales = await this.localeService
      .getAll()
      .then(locales => locales.filter(l => l.name !== buildKeysDto.langInRepo));
    // TODO: надо обновить ключи п

    const data: string = await this.gitLabService.getMainLocaleFileFromGitLab({
      linkToRepo: buildKeysDto.linkToRepo,
    });
    const parsedData = await this.realiseEval(data, buildKeysDto.langInRepo);

    await this.fileService.buildTruthLocaleFile({
      extension: buildKeysDto.extension,
      project: buildKeysDto.project,
      dictionary: parsedData,
      lang: buildKeysDto.langInRepo,
    });

    const rowKeys = Object.keys(parsedData).reduce((acc, key: string):
      | IKeysMeta['keys']
      | [] => {
      const translatePayload = {
        lang: buildKeysDto.langInRepo,
        translator: { name: 'default', role: 'truthful' },
        translate: parsedData[key],
        truthful: true,
      };

      const a = {
        name: key,
        translatedInTo: [translatePayload],
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
      consumer: buildKeysDto.consumer,
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

  async getFilledKeysMeta(
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
      return await this.keysMetaModel.findById(curConsumer.keysMetaId).exec();
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

  async getProjecstWithConsumer(): Promise<IProject[] | INotifications> {
    const arrOfProjects = await this.projectModel.find({}).exec();
    if (!arrOfProjects) {
      return {
        status: 0,
        message: 'Project list empty',
      };
    } else return arrOfProjects;
    //TODO:
  }

  async updateKeys(updateKeysDto: UpdateKeysDto): Promise<INotifications> {
    const { consumer, project, linkToRepo } = updateKeysDto;
    const isProjectExist = await this.checkProjectExist({ consumer, project });
    if (!isProjectExist)
      return {
        status: 0,
        message: `Project '${project}' with consumer '${consumer}' does't exist`,
      };

    const curentProject = await this.getFilledProject({ consumer, project });
    const {
      linkToRepo: curentRepoLink,
      truthfulLocale,
      keysMetaId,
    } = curentProject[0].consumers[0]; //Инфа сотка выше все проверки

    const curentMetaKeys = await this.getKeysMeta({ consumer, project });

    const data: string = await this.gitLabService.getMainLocaleFileFromGitLab({
      linkToRepo: curentRepoLink,
    });
    const parsedData = await this.realiseEval(data, truthfulLocale);
    const arrOfParsedDataKeys = Object.keys(parsedData);

    //@ts-ignore
    if (arrOfParsedDataKeys.length === curentMetaKeys.keys.length) {
      return {
        status: 0,
        message: `Nothing to Update`,
      };
    }

    //@ts-ignore
    const flatenCurrentMetaKeys = curentMetaKeys.keys.reduce((acc, key) => {
      return [...acc, key.name];
    }, []);

    const differenceInKeys = difference(
      arrOfParsedDataKeys,
      flatenCurrentMetaKeys,
    );

    const newKeys = differenceInKeys.reduce((acc, key: string) => {
      const newKey = {
        name: key,
        translatedInTo: [
          {
            lang: truthfulLocale,
            translator: { name: 'default', role: 'truthful' },
            translate: parsedData[key],
            truthful: true,
          },
        ],
      };
      return [...acc, newKey];
    }, []);

    let savedKeys = [];
    const savedKeysIds = [];
    await this.key.insertMany(newKeys).then(keys => {
      keys.map(k => {
        savedKeysIds.push(k._id);
        savedKeys = [...savedKeys, { key: k._id, name: k.name }];
      });
    });

    const existLocales = await this.localeService
      .getAll()
      .then(locales => locales.filter(l => l.name !== truthfulLocale));

    (async () => {
      for (const el of existLocales) {
        await this.localeService.updateProjectKeys({
          name: el.name,
          ids: savedKeysIds,
        });
      }
    })();

    const processArray = async array => {
      for (const item of array) {
        try {
          await this.keysMetaModel.findByIdAndUpdate(
            { _id: keysMetaId },
            {
              $addToSet: {
                keys: item,
              },
              $set: {
                keysQuantity: flatenCurrentMetaKeys.length,
              },
            },
          );
        } catch (error) {
          console.log(error);
        }
      }
    };
    await processArray(savedKeys);

    const notice: INotifications = {
      status: 1,
      message: `For project '${project}' with consumer '${consumer}' check difference and that ${differenceInKeys.length} keys we add it into bd`,
      aditionalField: { keys: differenceInKeys, savedKeys: savedKeys },
    };
    return notice;
  }

  async updateOrCreateKey(updateKeyDto: UpdateKeyDto): Promise<any> {
    const {
      keyName,
      truthfulLocaleTranslate,
      consumer,
      project,
      ID,
    } = updateKeyDto;

    const curentProject = await this.getFilledProject({ consumer, project });
    const { truthfulLocale, keysMetaId } = curentProject[0].consumers[0];

    const translatePayload: ITranslatedInTo = {
      lang: truthfulLocale,
      translator: { name: 'default', role: 'truthful' },
      translate: truthfulLocaleTranslate,
      truthful: true,
    };

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const q = ID ? { _id: ID } : { name: keyName };

    const keyPayload = {
      name: keyName,
      translatedInTo: [translatePayload],
    };
    //@ts-ignore

    let newKey;
    await this.key.findOneAndUpdate(q, keyPayload, options).then(async nk => {
      newKey = nk;
      await Promise.all(
        curentProject[0].usedLocales
          .filter(locale => locale !== truthfulLocale)
          .map(
            async locale =>
              await this.localeService.updateProjectKeys({
                truthful: true,
                name: locale,
                ids: [nk._id],
              }),
          ),
      );
    });

    const { keysQuantity } = await this.keysMetaModel
      .findById(keysMetaId)
      .lean()
      .exec();
    await this.keysMetaModel.findByIdAndUpdate(
      { _id: keysMetaId },
      {
        $addToSet: {
          //@ts-ignore
          keys: { _id: newKey._id, name: newKey.name },
        },
        $set: {
          keysQuantity: keysQuantity + 1,
        },
      },
    );
    return newKey;
  }
}
