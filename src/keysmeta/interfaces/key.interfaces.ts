import { Document } from 'mongoose';

export interface IKey extends Document {
  name: string;
  translatedInTo: ITranslatedInTo[];
}
interface ITranslatedInTo {
  lang: string;
  translator: {
    name: string;
    id: number;
  };
}
