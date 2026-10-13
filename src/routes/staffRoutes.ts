import { Router } from 'express';
import { StaffController } from '../controllers/staffController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireManager, requireSelfOrSuperAdmin } from '../middleware/rbac.js';

const router = Router();

// All staff routes require authentication
router.use(authenticateToken);

// Read staff list and details (any authenticated staff can read)
router.get('/', StaffController.getStaffList);
router.get('/:id', StaffController.getStaffById);

// Create, Toggle Status, and Delete require Admin or Super Admin
router.post('/', requireManager, StaffController.createStaff);
router.patch('/:id/status', requireManager, StaffController.toggleStatus);
router.delete('/:id', requireManager, StaffController.deleteStaff);

// Update staff: Super Admin can update any; Moderator can only update their own non-role fields
router.put('/:id', requireSelfOrSuperAdmin, StaffController.updateStaff);

export default router;
