import { Document } from 'mongoose';
import { IProject } from './project.interface';

export interface IKeysMeta extends Document {
  keys: [IKeyMeta];
  length: number;
  project: IProject;
}

export interface IKeyMeta extends Document {
  name: string;
  key: string;
}
// const isExist = await this.checkExistkeyMeta();

// const keysMeta = await this.keysMetaModel
//   .findOne({
//     project: createLocaleDto.project,
//   })
//   .populate({ path: 'keys', populate: { path: 'key' } })
//   .exec();
// const keyMetaObj = keysMeta.toObject();
// const extension = keyMetaObj.extension;

// let truthfulDictionary;
// if (isExist) {
//   const locale = new this.localeModel(createLocaleDto);
//   if (locale.truthful) {
//     truthfulDictionary = await this.fileService.buildTruthLocaleFile({
//       lang: createLocaleDto.name,
//       project: createLocaleDto.project,
//       extension,
//     });
//   } else {
//     this.fileService.buildLocaleFileWithEmptyStrings(
//       createLocaleDto,
//       extension,
//     );
//   }

//   const newKeys = keyMetaObj.keys.reduce((acc, key) => {
//     const translatePayload = {
//       lang: createLocaleDto.name,
//       translator: { name: 'unkwnow', role: 'unknow' },
//       translate: locale.truthful ? truthfulDictionary[key.name] : '',
//       truthful: locale.truthful,
//     };
//     const newkey = {
//       ...key,
//       translatedInTo: [...key.translatedInTo, translatePayload],
//     };
//     return [...acc, newkey];
//   }, []);

//   await this.keysMetaModel.updateOne(
//     { project: createLocaleDto.project },
//     { keys: newKeys },
//   );
//   await keysMeta.save();

//   return await locale.save();
// } else {
//   throw new Error('keys does not exist');
// }
