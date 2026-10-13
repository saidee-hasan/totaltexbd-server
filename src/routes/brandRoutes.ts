import { Brand } from '../models/Brand.js';
import { createTaxonomyService } from '../services/taxonomyService.js';
import { createTaxonomyController } from '../controllers/taxonomyController.js';
import { createTaxonomyRouter } from './taxonomyRouter.js';

const service = createTaxonomyService(Brand, {
  label: 'Brand',
  fields: ['name', 'slug', 'description', 'seoTitle', 'metaDescription', 'keywords', 'status', 'sortOrder', 'logo', 'website'],
  searchFields: ['name', 'slug', 'description'],
});

export default createTaxonomyRouter(createTaxonomyController(service));
