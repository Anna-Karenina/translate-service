import { Document } from 'mongoose';

export interface ILocale extends Document {
  readonly _id: string;
  readonly name: string;
  readonly shortCut: string;
  readonly created?: string;
  readonly updated?: string;
  readonly project: string;
}
