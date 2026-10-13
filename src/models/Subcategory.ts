import mongoose, { Document, Schema, Model } from 'mongoose';
import { ISubcategory } from '../types/taxonomy.types.js';
import { taxonomyBasePaths, taxonomyToJSON } from './taxonomySchema.js';

export interface ISubcategoryDocument extends Omit<ISubcategory, '_id'>, Document {}

const subcategorySchema = new Schema<ISubcategoryDocument>(
  {
    ...taxonomyBasePaths(),
    category: {
      type: String,
      required: [true, 'Parent category is required'],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      trim: true,
    },
    h1Title: {
      type: String,
      trim: true,
    },
    longDescription: {
      type: String,
    },
  },
  { timestamps: true, toJSON: taxonomyToJSON }
);

export const Subcategory: Model<ISubcategoryDocument> = mongoose.model<ISubcategoryDocument>(
  'Subcategory',
  subcategorySchema
);
