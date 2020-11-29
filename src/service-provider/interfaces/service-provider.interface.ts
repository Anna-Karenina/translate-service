import { Document } from 'mongoose';

export interface IServiceProvider extends Document {
  name: string;
  url: string;
  token: {
    secretKey: string;
    expireAt: string;
  };
  formatGroup: string;
}
