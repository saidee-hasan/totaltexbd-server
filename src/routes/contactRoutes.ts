import { Router } from 'express';
import { ContactController } from '../controllers/contactController.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimit } from '../middleware/security.js';

const router = Router();

// Public: storefront contact form. Rate-limited to deter spam/abuse.
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: 'Too many messages submitted. Please try again later.',
});

router.post('/', contactLimiter, ContactController.create);

// Protected: admin inbox
router.get('/', authenticateToken, ContactController.list);
router.patch('/:id/read', authenticateToken, ContactController.markRead);
router.delete('/:id', authenticateToken, ContactController.remove);

export default router;
