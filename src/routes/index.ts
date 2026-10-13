import { Router } from 'express';
import authRoutes from './authRoutes.js';
import staffRoutes from './staffRoutes.js';
import productRoutes from './productRoutes.js';
import sectionRoutes from './sectionRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subcategoryRoutes from './subcategoryRoutes.js';
import brandRoutes from './brandRoutes.js';
import colorRoutes from './colorRoutes.js';
import sizeRoutes from './sizeRoutes.js';
import newsRoutes from './newsRoutes.js';
import contactRoutes from './contactRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/staff', staffRoutes);
router.use('/products', productRoutes);
router.use('/sections', sectionRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/brands', brandRoutes);
router.use('/colors', colorRoutes);
router.use('/sizes', sizeRoutes);
router.use('/news', newsRoutes);
router.use('/contact', contactRoutes);

export default router;
