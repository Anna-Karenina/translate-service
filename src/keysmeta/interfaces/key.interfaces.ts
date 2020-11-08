import { Document } from 'mongoose';

export interface IKey extends Document {
  name: string;
  translatedInTo: ITranslatedInTo[];
}
export interface ITranslatedInTo {
  lang: string;
  translate: string;
  truthful: boolean;
  translator: {
    name: string;
    role: string;
  };
}
