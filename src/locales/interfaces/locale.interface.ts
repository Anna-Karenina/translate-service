import { Document } from 'mongoose';

export interface ILocale extends Document {
  readonly _id: string;
  readonly name: string;
  readonly shortCut: string;
  readonly project: string;
  readonly truthful: boolean;
  readonly created?: string;
  readonly updated?: string;
}
