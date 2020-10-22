import * as mongoose from 'mongoose';

const KeySchema = new mongoose.Schema(
  {
    name: { type: String },
    translatedInTo: [
      {
        lang: { type: String },
        translator: {
          name: { type: String, default: 'unknow' },
          id: { type: Number, default: 'unknow' },
        },
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
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
