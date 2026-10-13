import mongoose, { Document, Schema, Model } from 'mongoose';
import { IColor } from '../types/taxonomy.types.js';
import { taxonomyBasePaths, taxonomyToJSON } from './taxonomySchema.js';

export interface IColorDocument extends Omit<IColor, '_id'>, Document {}

const colorSchema = new Schema<IColorDocument>(
  {
    ...taxonomyBasePaths(),
    hex: {
      type: String,
      trim: true,
      default: '#000000',
    },
  },
  { timestamps: true, toJSON: taxonomyToJSON }
);

export const Color: Model<IColorDocument> = mongoose.model<IColorDocument>('Color', colorSchema);
