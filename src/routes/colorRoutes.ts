import { Color } from '../models/Color.js';
import { createTaxonomyService } from '../services/taxonomyService.js';
import { createTaxonomyController } from '../controllers/taxonomyController.js';
import { createTaxonomyRouter } from './taxonomyRouter.js';

const service = createTaxonomyService(Color, {
  label: 'Color',
  fields: ['name', 'slug', 'hex', 'description', 'seoTitle', 'metaDescription', 'keywords', 'status', 'sortOrder'],
  searchFields: ['name', 'slug', 'hex'],
});

export default createTaxonomyRouter(createTaxonomyController(service));
