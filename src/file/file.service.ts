import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { join, resolve } from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
// import { KeysmetaService } from 'src/keysmeta/keysmeta.service';
// import { IKeysMeta } from 'src/keysmeta/interfaces/keysmeta.interface';
// import { GetKeysDto } from 'src/keysmeta/dto/get-keys.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly configService: ConfigService, // private readonly keysmetaService: KeysmetaService,
  ) {}

  // private async getLocaleKeys(getKeysDto: GetKeysDto): Promise<IKeysMeta> {
  //   const keys = await this.keysmetaService.getKeysMeta(getKeysDto);
  //   return keys;
  // }

  private checkСonditions(): string {
    const localeFolderName = this.configService.get<string>('TRANSLATE_FOLDER');
    const filefolder = join(resolve(), `/${localeFolderName}`);
    if (!existsSync(filefolder)) {
      mkdirSync(filefolder);
    }
    return filefolder;
  }

  // buildTruthLocaleFile(dictionary, lang, extension) {
  //   const path = this.checkСonditions();

  //   const writeble = createWriteStream(resolve(path, `${lang}.${extension}`));
  //   writeble.write(`export const ${lang} = {\n`);
  //   Object.keys(dictionary).forEach(d => {
  //     writeble.write(
  //       `${d}: "${dictionary[d]
  //         .replace(/[\s{2,}]+/g, ' ')
  //         .replace(/"/g, ' ')
  //         .trim()}",\n`,
  //     );
  //   });
  //   writeble.write(`};`);
  //   writeble.end();
  //   return true;
  // }

  async buildLocaleFileWithEmptyStrings({ name, project }) {
    const extension = 'js';
    const path = this.checkСonditions();
    // const writeble = createWriteStream(
    //   resolve(path, `${project}/${name}.${extension}`),
    // );
    // const k = await this.getLocaleKeys({ project });
    // const arrofKeys = k.keys.reduce((acc: string[], key) => {
    //   return [...acc, key.name];
    // }, []);

    // Object.keys(arrofKeys).forEach(k => {
    //   writeble.write(`${k}: ' ',\n`);
    // });
    // writeble.write(`};`);
    // writeble.end();
    return true;
  }
}
