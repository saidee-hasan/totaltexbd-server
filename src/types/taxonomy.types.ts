export type TaxonomyStatus = 'active' | 'inactive';

export interface ITaxonomyBase {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  status: TaxonomyStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends ITaxonomyBase {
  image?: string;
  h1Title?: string;
  longDescription?: string;
}

export interface ISubcategory extends ITaxonomyBase {
  category: string;
  image?: string;
  h1Title?: string;
  longDescription?: string;
}

export interface IBrand extends ITaxonomyBase {
  logo?: string;
  website?: string;
}

export interface IColor extends ITaxonomyBase {
  hex: string;
}

export type SizeGroup = 'adult' | 'kids';

export interface ISize extends ITaxonomyBase {
  group: SizeGroup;
}
