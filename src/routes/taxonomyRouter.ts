import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createTaxonomyController } from '../controllers/taxonomyController.js';

export const createTaxonomyRouter = (
  controller: ReturnType<typeof createTaxonomyController>
): Router => {
  const router = Router();

  // Public reads for the client storefront
  router.get('/', controller.getList);
  router.get('/:id', controller.getById);

  // Protected writes
  router.post('/', authenticateToken, controller.create);
  router.put('/:id', authenticateToken, controller.update);
  router.delete('/:id', authenticateToken, controller.remove);

  return router;
};
