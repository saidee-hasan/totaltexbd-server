import mongoose, { Model } from 'mongoose';
import { slugify } from '../utils/slugify.js';

export interface TaxonomyConfig {
  label: string;
  fields: string[];
  required?: string[];
  searchFields?: string[];
  filterFields?: string[];
  defaultSort?: Record<string, 1 | -1>;
  slugSource?: string;
  slugFields?: string[];
}

export interface TaxonomyListQuery {
  search?: string;
  [key: string]: unknown;
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createTaxonomyService = (model: Model<any>, config: TaxonomyConfig) => {
  const {
    label,
    fields,
    required = ['name'],
    searchFields = ['name', 'slug'],
    filterFields = ['status'],
    defaultSort = { sortOrder: 1, name: 1 },
    slugSource = 'name',
    slugFields,
  } = config;

  const buildPayload = (data: Record<string, any>): Record<string, any> => {
    const payload: Record<string, any> = {};
    for (const field of fields) {
      if (data[field] === undefined) continue;
      let value = data[field];
      if (typeof value === 'string') value = value.trim();
      payload[field] = value;
    }
    if (typeof payload.name === 'string') payload.name = payload.name.trim();

    let sourceValue: string | undefined = payload.slug;
    if (!sourceValue && slugFields && slugFields.length) {
      sourceValue = slugFields.map((f) => payload[f]).filter(Boolean).join(' ');
    }
    if (!sourceValue) sourceValue = payload[slugSource];
    if (sourceValue) payload.slug = slugify(sourceValue);
    return payload;
  };

  return {
    async list(query: TaxonomyListQuery) {
      const filter: Record<string, any> = {};
      const search = typeof query.search === 'string' ? query.search.trim() : '';
      if (search) {
        const rx = new RegExp(escapeRegex(search), 'i');
        filter.$or = searchFields.map((f) => ({ [f]: rx }));
      }
      for (const f of filterFields) {
        const raw = query[f];
        const val = Array.isArray(raw) ? raw[0] : raw;
        if (val && val !== 'all') filter[f] = val;
      }
      const items = await model.find(filter).sort(defaultSort);
      return { items: items.map((d: any) => d.toJSON()), total: items.length };
    },

    async getById(id: string) {
      let doc = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        doc = await model.findById(id);
      }
      if (!doc) {
        doc = await model.findOne({ slug: id });
      }
      if (!doc) throw { status: 404, message: `${label} not found.` };
      return doc.toJSON();
    },

    async create(data: Record<string, any>) {
      for (const field of required) {
        if (data[field] === undefined || data[field] === null || String(data[field]).trim() === '') {
          throw { status: 400, message: `${field === 'name' ? label : field} is required.` };
        }
      }
      const payload = buildPayload(data);
      const doc = new model(payload);
      await doc.save();
      return doc.toJSON();
    },

    async update(id: string, data: Record<string, any>) {
      const doc = await model.findById(id);
      if (!doc) throw { status: 404, message: `${label} not found.` };
      const payload = buildPayload(data);
      Object.assign(doc, payload);
      await doc.save();
      return doc.toJSON();
    },

    async remove(id: string) {
      const doc = await model.findById(id);
      if (!doc) throw { status: 404, message: `${label} not found.` };
      await model.findByIdAndDelete(id);
    },
  };
};

export type TaxonomyService = ReturnType<typeof createTaxonomyService>;
