import { Document } from 'mongoose';

export interface IServiceProvider extends Document {
  name: string;
  url: string;
  token: {
    secret_key: string;
    expireAt: string;
  };
  formatGroup: string;
}
