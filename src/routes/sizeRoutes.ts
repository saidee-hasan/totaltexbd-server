import { Size } from '../models/Size.js';
import { createTaxonomyService } from '../services/taxonomyService.js';
import { createTaxonomyController } from '../controllers/taxonomyController.js';
import { createTaxonomyRouter } from './taxonomyRouter.js';

const service = createTaxonomyService(Size, {
  label: 'Size',
  fields: ['name', 'slug', 'group', 'description', 'seoTitle', 'metaDescription', 'keywords', 'status', 'sortOrder'],
  searchFields: ['name', 'slug'],
  filterFields: ['status', 'group'],
});

export default createTaxonomyRouter(createTaxonomyController(service));
