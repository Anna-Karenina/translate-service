import * as mongoose from 'mongoose';

export const LocaleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortCut: { type: String, requird: true },
    project: { type: mongoose.Types.ObjectId, required: true, ref: 'Project' },
    truthful: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } },
);

LocaleSchema.index({ unique: true });
