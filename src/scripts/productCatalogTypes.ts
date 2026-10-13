export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSize {
  name: string;
  inStock: boolean;
}

export interface ProductVariant {
  color: string;
  colorHex: string;
  size: string;
  sku: string;
  stock: number;
  price: string;
}

export type ProductStockStatus = 'in-stock' | 'out-of-stock' | 'pre-order';

export interface ProductSeed {
  name: string;
  sku: string;
  price: string;
  category: string;
  subCategory: string;
  brand: string;
  productType: string;
  shortDescription: string;
  description: string;
  imgPrimary: string;
  imgSecondary: string;
  galleryImages: string[];
  imageAlt: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  variants: ProductVariant[];
  gender: string;
  material: string;
  pattern: string;
  fit: string;
  sleeveType: string;
  neckType: string;
  stockStatus: ProductStockStatus;
  inStock: boolean;
  featured: boolean;
  seoTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string;
}
