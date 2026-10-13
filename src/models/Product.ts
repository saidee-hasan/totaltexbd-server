import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProductColor {
  name: string;
  hex: string;
}

export interface IProductSize {
  name: string;
  inStock: boolean;
}

export interface IProductVariant {
  color: string;
  colorHex: string;
  size: string;
  sku: string;
  stock: number;
  price?: string;
}

export type StockStatus = 'in-stock' | 'out-of-stock' | 'pre-order';

export interface IProduct {
  _id: string;
  name: string;
  sku: string;
  price: string;
  category: string;
  subCategory?: string;
  brand: string;
  productType: string;
  shortDescription: string;
  description?: string;
  imgPrimary: string;
  imgSecondary?: string;
  galleryImages: string[];
  imageAlt: string;
  colors: IProductColor[];
  sizes: IProductSize[];
  variants: IProductVariant[];
  gender: string;
  material: string;
  pattern: string;
  fit: string;
  sleeveType: string;
  neckType: string;
  stockStatus: StockStatus;
  inStock: boolean;
  featured: boolean;
  seoTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
      index: true,
      sparse: true,
    },
    price: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Mens Clothing',
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: 'General',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    productType: {
      type: String,
      trim: true,
      default: '',
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    imgPrimary: {
      type: String,
      required: [true, 'Primary image URL is required'],
      trim: true,
    },
    imgSecondary: {
      type: String,
      trim: true,
      default: '',
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    imageAlt: {
      type: String,
      trim: true,
      default: '',
    },
    colors: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          hex: { type: String, trim: true, default: '#000000' },
        },
      ],
      default: [],
    },
    sizes: {
      type: [
        {
          name: { type: String, trim: true },
          inStock: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    variants: {
      type: [
        {
          color: { type: String, trim: true, default: '' },
          colorHex: { type: String, trim: true, default: '#000000' },
          size: { type: String, trim: true, default: '' },
          sku: { type: String, trim: true, default: '' },
          stock: { type: Number, default: 0, min: 0 },
          price: { type: String, trim: true, default: '' },
        },
      ],
      default: [],
    },
    gender: {
      type: String,
      trim: true,
      default: 'Unisex',
    },
    material: {
      type: String,
      trim: true,
      default: '',
    },
    pattern: {
      type: String,
      trim: true,
      default: '',
    },
    fit: {
      type: String,
      trim: true,
      default: '',
    },
    sleeveType: {
      type: String,
      trim: true,
      default: '',
    },
    neckType: {
      type: String,
      trim: true,
      default: '',
    },
    stockStatus: {
      type: String,
      enum: {
        values: ['in-stock', 'out-of-stock', 'pre-order'],
        message: '{VALUE} is not a valid stock status',
      },
      default: 'in-stock',
    },
    inStock: {
      type: Boolean,
      default: true,
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
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      index: true,
    },
    keywords: {
      type: String,
      trim: true,
      default: '',
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

export const Product: Model<IProductDocument> = mongoose.model<IProductDocument>('Product', productSchema);
