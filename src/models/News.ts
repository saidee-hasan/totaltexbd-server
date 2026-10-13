import mongoose, { Document, Schema, Model } from 'mongoose';
import { taxonomyToJSON } from './taxonomySchema.js';

export interface INews {
  _id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
  featured: boolean;
  seoTitle: string;
  metaDescription: string;
  keywords: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewsDocument extends Omit<INews, '_id'>, Document {}

const newsSchema = new Schema<INewsDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    date: {
      type: String,
      trim: true,
      default: '',
    },
    readTime: {
      type: String,
      trim: true,
      default: '',
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    seoTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
    },
    keywords: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toJSON: taxonomyToJSON }
);

export const News: Model<INewsDocument> = mongoose.model<INewsDocument>('News', newsSchema);
