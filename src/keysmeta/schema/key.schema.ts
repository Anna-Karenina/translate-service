import * as mongoose from 'mongoose';

export const KeySchema = new mongoose.Schema(
  {
    name: { type: String },
    translatedInTo: [
      {
        lang: { type: String },
        translate: { type: String, default: '' },
        truthful: { type: Boolean, default: false },
        translator: {
          name: { type: String, default: 'unknow' },
          role: { type: String, default: 'unknow' },
        },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
