/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { join, resolve } from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { IKeysMeta } from 'src/keysmeta/interfaces/keysmeta.interface';
import { Model } from 'mongoose';
import { GetKeysDto } from 'src/keysmeta/dto/get-keys.dto';
import { CreateLocaleDto } from 'src/locales/dto/create-locale.dto';
import { GitlabService } from 'src/gitlab/gitlab.service';
import { GetFileDto } from 'src/keysmeta/dto/get-file.dto';
import { statSync } from 'fs';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('KeysMeta')
    private readonly keysMetaModel: Model<IKeysMeta>,
    private readonly gitLabService: GitlabService,
    private readonly configService: ConfigService, // private readonly keysmetaService: KeysmetaService,
  ) {}

  private realiseEval = (jsString: string, lang: string) => {
    const code = jsString.replace(`export const ${lang} = `, '');
    const str = `(function (){
    return ${code} })()`;
    return eval(str);
  };

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

  // async buildJavaScriptFile(getFileDto: GetFileDto) {
  //   const { project, lang } = getFileDto;
  //   const keys = await this.keysMetaModel
  //     .findOne({ project })
  //     .populate('keys')
  //     .exec();
  //   const path = this.checkСonditions(project);
  //   const filePath = resolve(path, `${lang}.${keys.extension}`);

  //   await new Promise((resolve, reject) => {
  //     const writeble = createWriteStream(filePath);
  //     writeble.write(`export const ${lang} = {\n`);

  //     keys.keys.reduce((acc: any, key) => {
  //       //@ts-ignore
  //       const currentTranslate = key.translatedInTo.find(k => k.lang === lang);
  //       const a = [key.name];
  //       const str = writeble.write(
  //         `${a}: "${currentTranslate.translate
  //           .replace(/[\s{2,}]+/g, ' ')
  //           .replace(/"/g, ' ')
  //           .trim()}",\n`,
  //       );
  //       acc = { ...acc, str };
  //       return acc;
  //     }, {});
  //     writeble.write(`};`);
  //     writeble.end();
  //     writeble.on('finish', () => {
  //       resolve(true);
  //     });
  //     writeble.on('error', reject);
  //   });

  //   return filePath;
  // }
  // async buildJSONFile(getFileDto: GetFileDto){}

  // async buildIniFile(getFileDto: GetFileDto){}

  async buildFileByProjectName(getFileDto: GetFileDto): Promise<any> {
    const { extension } = getFileDto;
    let filePath: string;
    switch (extension) {
      case 'js':
      // return (filePath = await this.buildJavaScriptFile(getFileDto));
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
