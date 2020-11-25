import { Document } from 'mongoose';
import { consumersEnum } from '../enums/consumers.enum';
import { extensionEnum } from '../enums/extensions.enum';

export interface IProject extends Document {
  projectName: string;
  consumers: [IProjectConsumer];
  usedLocales: [string];
}
export interface IProjectConsumer extends Document {
  userWhitelist?: [any];
  consumerType: consumersEnum;
  fileExtension: extensionEnum;
  linkToRepo: string;
  keysMetaId: string;
  truthfulLocale: string;
}
