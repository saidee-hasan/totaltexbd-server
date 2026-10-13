import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISectionStat {
  label: string;
  value: string;
}

export interface ISection {
  _id: string;
  sectionKey: string;
  sectionName: string;
  category?: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  images?: string[];
  badgeText?: string;
  buttonText?: string;
  buttonLink?: string;
  stats?: ISectionStat[];
  seoTitle?: string;
  metaDescription?: string;
  content?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISectionDocument extends Omit<ISection, '_id'>, Document {}

const sectionSchema = new Schema<ISectionDocument>(
  {
    sectionKey: {
      type: String,
      required: [true, 'Section key is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    sectionName: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Homepage',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    badgeText: {
      type: String,
      trim: true,
      default: '',
    },
    buttonText: {
      type: String,
      trim: true,
      default: '',
    },
    buttonLink: {
      type: String,
      trim: true,
      default: '',
    },
    stats: [
      {
        label: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
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
    content: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret._id = String(ret._id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Section: Model<ISectionDocument> = mongoose.model<ISectionDocument>('Section', sectionSchema);
