import { Document } from 'mongoose';
import { extensionEnum } from '../enums/extensions.enum';
import { IKey } from './key.interfaces';

export interface IKeysMeta extends Document {
  keys: [IKey];
  length: number;
  project: string;
  extension: extensionEnum;
}
