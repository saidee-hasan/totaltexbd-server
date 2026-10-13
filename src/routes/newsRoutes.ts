import { News } from '../models/News.js';
import { createTaxonomyService } from '../services/taxonomyService.js';
import { createTaxonomyController } from '../controllers/taxonomyController.js';
import { createTaxonomyRouter } from './taxonomyRouter.js';

const service = createTaxonomyService(News, {
  label: 'News',
  fields: [
    'title',
    'slug',
    'category',
    'date',
    'readTime',
    'excerpt',
    'content',
    'image',
    'featured',
    'seoTitle',
    'metaDescription',
    'keywords',
    'status',
    'sortOrder',
  ],
  required: ['title'],
  slugSource: 'title',
  searchFields: ['title', 'slug', 'category', 'excerpt'],
  filterFields: ['status', 'category'],
  defaultSort: { createdAt: -1 },
});

export default createTaxonomyRouter(createTaxonomyController(service));
