import * as mongoose from 'mongoose';

export const LocaleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortCut: { type: String, requird: true },
    project: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } },
);

LocaleSchema.index({ unique: true });
