import * as mongoose from 'mongoose';
import { consumersEnum } from '../enums/consumers.enum';
import { extensionEnum } from '../enums/extensions.enum';

export const ProjectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    usedLocales: { type: [String] },
    consumers: [
      {
        consumerType: {
          type: String,
          enum: Object.keys(consumersEnum),
          required: true,
        },
        linkToRepo: { type: String, required: true },
        keysMetaId: { type: String },
        fileExtension: {
          type: String,
          enum: Object.keys(extensionEnum),
          required: true,
        },
        userWhitelist: { type: [String] },
      },
    ],
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } },
);

ProjectSchema.index({ unique: true });
