import { Router } from 'express';
import { SectionController } from '../controllers/sectionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public: client site reads sections
router.get('/', SectionController.getSections);
router.get('/:key', SectionController.getSectionByKey);

// Protected: only authenticated staff can update sections
router.put('/:key', authenticateToken, SectionController.updateSection);
router.patch('/:key', authenticateToken, SectionController.updateSection);

export default router;
