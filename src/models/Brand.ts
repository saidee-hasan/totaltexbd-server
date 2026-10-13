import mongoose, { Document, Schema, Model } from 'mongoose';
import { IBrand } from '../types/taxonomy.types.js';
import { taxonomyBasePaths, taxonomyToJSON } from './taxonomySchema.js';

export interface IBrandDocument extends Omit<IBrand, '_id'>, Document {}

const brandSchema = new Schema<IBrandDocument>(
  {
    ...taxonomyBasePaths(),
    logo: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true, toJSON: taxonomyToJSON }
);

export const Brand: Model<IBrandDocument> = mongoose.model<IBrandDocument>('Brand', brandSchema);
