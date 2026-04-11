import express from 'express';
import {
  addMenuItem,
  getMenuByCanteen,
  getAllMenuItems,
  getMenuItemByRef,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getMenuStatistics,
} from '../../controllers/Canteen/menuController.js';
import { optionalAuth } from '../../middleware/Canteen/optionalAuth.js';
import { requireAdmin } from '../../middleware/Canteen/requireAdmin.js';

const router = express.Router();

// Public routes - Get menu items
router.get('/canteen/:canteen', getMenuByCanteen);
router.get('/ref/:refNumber', getMenuItemByRef);

// Admin routes - requires authentication
router.use(optionalAuth);
router.use(requireAdmin);

// Admin: Get all menu items with filters
router.get('/', getAllMenuItems);

// Admin: Add new menu item
router.post('/', addMenuItem);

// Admin: Get menu statistics
router.get('/stats/overview', getMenuStatistics);

// Admin: Update menu item
router.put('/:id', updateMenuItem);

// Admin: Delete menu item
router.delete('/:id', deleteMenuItem);

// Admin: Toggle menu item availability
router.patch('/:id/toggle-availability', toggleMenuItemAvailability);

export default router;
