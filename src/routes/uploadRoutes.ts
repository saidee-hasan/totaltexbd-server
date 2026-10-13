import { Router } from 'express';
import { UploadController } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimit } from '../middleware/security.js';

const router = Router();

// Uploads are authenticated; still throttle to limit storage/abuse.
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many uploads. Please slow down and try again shortly.',
});

// Image upload requires authenticated staff
router.post('/', authenticateToken, uploadLimiter, UploadController.uploadImage);
router.post('/video', authenticateToken, uploadLimiter, UploadController.uploadVideo);
router.post('/delete', authenticateToken, UploadController.deleteImage);
router.get('/config', UploadController.getConfig);

export default router;
