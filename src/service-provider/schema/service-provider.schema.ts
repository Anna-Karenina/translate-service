import * as mongoose from 'mongoose';

export const ServiceProviderSchema = new mongoose.Schema(
  {
    name: { type: String },
    url: { type: String },
    token: {
      secretKey: { type: String },
      expireAt: { type: Date },
    },
    formatGroup: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
