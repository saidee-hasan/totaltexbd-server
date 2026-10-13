import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public: client site can read products
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Protected: only authenticated staff can create, update, or delete products
router.post('/', authenticateToken, ProductController.createProduct);
router.put('/:id', authenticateToken, ProductController.updateProduct);
router.delete('/:id', authenticateToken, ProductController.deleteProduct);

export default router;
