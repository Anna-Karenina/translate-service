import { Document } from 'mongoose';
import { IKey } from './key.interfaces';

export interface IKeysMeta extends Document {
  keys: [IKey];
  length: number;
  project: string;
}
