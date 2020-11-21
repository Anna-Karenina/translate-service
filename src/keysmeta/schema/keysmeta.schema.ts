import * as mongoose from 'mongoose';

const KeyMetaSchema = new mongoose.Schema(
  {
    name: { type: String },
    key: { type: mongoose.Types.ObjectId, required: true, ref: 'Key' },
  },
  {
    _id: false,
  },
);

export const KeysMetaShema = new mongoose.Schema(
  {
    project: { type: mongoose.Types.ObjectId, required: true, ref: 'Project' },
    keys: { type: [KeyMetaSchema] },
    length: { type: Number },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
