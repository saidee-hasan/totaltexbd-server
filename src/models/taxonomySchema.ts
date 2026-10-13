import { SchemaDefinition } from 'mongoose';

export const taxonomyBasePaths = (): SchemaDefinition => ({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
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
});

export const taxonomyToJSON = {
  transform: (_: unknown, ret: any) => {
    ret._id = String(ret._id);
    delete ret.__v;
    return ret;
  },
};
