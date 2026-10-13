import mongoose, { Document, Schema, Model } from 'mongoose';
import { ISize } from '../types/taxonomy.types.js';
import { taxonomyBasePaths, taxonomyToJSON } from './taxonomySchema.js';

export interface ISizeDocument extends Omit<ISize, '_id'>, Document {}

const sizeSchema = new Schema<ISizeDocument>(
  {
    ...taxonomyBasePaths(),
    group: {
      type: String,
      enum: {
        values: ['adult', 'kids'],
        message: '{VALUE} is not a valid size group',
      },
      default: 'adult',
      index: true,
    },
  },
  { timestamps: true, toJSON: taxonomyToJSON }
);

export const Size: Model<ISizeDocument> = mongoose.model<ISizeDocument>('Size', sizeSchema);
