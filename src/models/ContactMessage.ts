import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  status: 'new' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactMessageDocument extends Omit<IContactMessage, '_id'>, Document {}

const contactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name is too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    company: {
      type: String,
      trim: true,
      default: '',
      maxlength: [160, 'Company is too long'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [40, 'Phone is too long'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message is too long'],
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'read'],
        message: '{VALUE} is not a valid status',
      },
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ContactMessage: Model<IContactMessageDocument> = mongoose.model<IContactMessageDocument>(
  'ContactMessage',
  contactMessageSchema
);
