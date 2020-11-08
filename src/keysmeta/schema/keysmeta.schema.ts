import * as mongoose from 'mongoose';
import { extensionEnum } from '../enums/extensions.enum';

export const KeySchema = new mongoose.Schema(
  {
    name: { type: String },
    translatedInTo: [
      {
        lang: { type: String },
        translate: { type: String, default: '' },
        translator: {
          name: { type: String, default: 'unknow' },
          role: { type: String, default: 'unknow' },
        },
        truthful: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const KeysMetaShema = new mongoose.Schema(
  {
    keys: { type: [KeySchema] },
    length: { type: Number },
    project: { type: String },
    extension: {
      type: String,
      enum: Object.keys(extensionEnum),
      default: 'js',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
