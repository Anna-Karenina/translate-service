/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { join, resolve } from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { IKeysMeta } from 'src/keysmeta/interfaces/keysmeta.interface';
import { Model } from 'mongoose';
import { GitlabService } from 'src/gitlab/gitlab.service';
import { GetFileDto } from 'src/file/dto/get-file.dto';
import { statSync } from 'fs';
import { IProject } from 'src/keysmeta/interfaces/project.interface';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('KeysMeta')
    private readonly keysMetaModel: Model<IKeysMeta>,
    @InjectModel('Project')
    private readonly projectModel: Model<IProject>,
    private readonly gitLabService: GitlabService,
    private readonly configService: ConfigService, // private readonly keysmetaService: KeysmetaService,
  ) {}

  private realiseEval = (jsString: string, lang: string) => {
    const code = jsString.replace(`export const ${lang} = `, '');
    const str = `(function (){
    return ${code} })()`;
    return eval(str);
  };

  // TODO:    забрать из кейсметасервиса сейчас циркулярка
  async getFilledProject({
    project,
    consumer,
  }): Promise<IProject[] | IProject> {
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
    return filtered[0];
  }

  checkСonditions(project?: string): string {
    const localeFolderName = this.configService.get<string>('TRANSLATE_FOLDER');
    const filefolder = join(resolve(), `/${localeFolderName}`);
    let projectFolder: string;
    if (!existsSync(filefolder)) {
      mkdirSync(filefolder);
    }
    if (project) {
      projectFolder = `${filefolder}/${project}`;
      if (!existsSync(projectFolder)) {
        mkdirSync(projectFolder);
      }
    }
    return projectFolder ? projectFolder : filefolder;
  }

  async buildTruthLocaleFile({ dictionary, lang, extension, project }) {
    const path = this.checkСonditions(project);
    const writeble = createWriteStream(resolve(path, `${lang}.${extension}`));
    writeble.write(`export const ${lang} = {\n`);
    Object.keys(dictionary).forEach(d => {
      writeble.write(
        `${d}: "${dictionary[d]
          .replace(/[\s{2,}]+/g, ' ')
          .replace(/"/g, ' ')
          .trim()}",\n`,
      );
    });
    writeble.write(`};`);
    writeble.end();
    return dictionary;
  }

  // async buildLocaleFileWithEmptyStrings(
  //   createLocaleDto: CreateLocaleDto,
  //   extension: string,
  // ): Promise<number> {
  //   const { name, project } = createLocaleDto;
  //   const path = this.checkСonditions(project);
  //   const writeble = createWriteStream(resolve(path, `${name}.${extension}`));
  //   const k = await this.getFilledKeysMeta({ project });
  //   if (k === null) {
  //     throw new Error('error passably project null');
  //   }
  //   writeble.write(`export const ${name} = {\n`);
  //   const arrofKeys = k.keys.reduce((acc: string[], key) => {
  //     return [...acc, writeble.write(`${key.name}: ' ',\n`)];
  //   }, []);

  //   writeble.write(`};`);
  //   writeble.end();
  //   return arrofKeys.length;
  // }

  // getReadableStream = (buffer: Buffer): Readable => {
  //   const stream = new Readable();
  //   stream.push(buffer);
  //   stream.push(null);
  //   return stream;
  // };

  async buildJavaScriptFile({
    consumer,
    project,
    lang,
    keysMetaId,
    fileExtension,
  }) {
    const { keys } = await this.keysMetaModel
      .findById(keysMetaId)
      .populate('keys.key')
      .exec();

    const path = this.checkСonditions(project);
    const filePath = resolve(path, `${lang}.${fileExtension}`);

    await new Promise((resolve, reject) => {
      const writeble = createWriteStream(filePath);
      writeble.write(`export const ${lang} = {\n`);
      console.log(keys);
      keys.reduce((acc: any, { key }) => {
        if (!key) return acc;
        //@ts-ignore
        const currentTranslate = key.translatedInTo.find(k => k.lang === lang);
        if (!currentTranslate) return acc;

        const str = writeble.write(
          //@ts-ignore

          `${key.name}: "${currentTranslate.translate
            .replace(/[\s{2,}]+/g, ' ')
            .replace(/"/g, ' ')
            .trim()}",\n`,
        );
        acc = { ...acc, str };
        return acc;
      }, {});
      writeble.write(`};`);
      writeble.end();
      writeble.on('finish', () => {
        resolve(true);
      });
      writeble.on('error', reject);
    });

    return filePath;
  }
  // async buildJSONFile(getFileDto: GetFileDto){}

  // async buildIniFile(getFileDto: GetFileDto){}

  async buildFileByProjectName(getFileDto: GetFileDto): Promise<any> {
    const { consumer, project } = getFileDto;
    const prj = await this.getFilledProject({ consumer, project });
    //@ts-ignore
    const { fileExtension, keysMetaId } = prj.consumers[0];
    const payload = {
      keysMetaId,
      fileExtension,
      ...getFileDto,
    };
    let filePath: string;
    switch (fileExtension) {
      case 'js':
        return (filePath = await this.buildJavaScriptFile(payload));
      case 'ts':
      // return (filePath = await this.buildJavaScriptFile(getFileDto));
      // case "ini":
      //   file = await this.buildIniFile(getFileDto)
      // case 'json':
      //   file =  await this.buildJSONFile(getFileDto)
    }
    return filePath;
  }

  getFilesizeInBytes(filename: string): number {
    const stats = statSync(filename);
    const fileSizeInBytes = stats['size'];
    return fileSizeInBytes;
  }
}
