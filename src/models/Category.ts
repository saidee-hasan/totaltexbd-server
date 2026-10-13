import mongoose, { Document, Schema, Model } from 'mongoose';
import { ICategory } from '../types/taxonomy.types.js';
import { taxonomyBasePaths, taxonomyToJSON } from './taxonomySchema.js';

export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {}

const categorySchema = new Schema<ICategoryDocument>(
  {
    ...taxonomyBasePaths(),
    image: {
      type: String,
      trim: true,
      default: '',
    },
    h1Title: {
      type: String,
      trim: true,
      default: '',
    },
    longDescription: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true, toJSON: taxonomyToJSON }
);

export const Category: Model<ICategoryDocument> = mongoose.model<ICategoryDocument>(
  'Category',
  categorySchema
);
