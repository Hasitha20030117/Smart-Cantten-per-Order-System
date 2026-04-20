import express from 'express';
import { 
  getPlans, 
  createSubscription, 
  checkSubscription, 
  getCurrentSubscription,
  cancelSubscription,
  getUserEvents,
  getSubscriptionHistory
} from '../controllers/subscription.controller.js';

const router = express.Router();

// Public routes
router.get('/plans', getPlans);

// Subscription management
router.post('/subscribe', createSubscription);
router.get('/check/:email', checkSubscription);
router.get('/current', getCurrentSubscription);
router.post('/cancel', cancelSubscription);

// User events
router.get('/user-events', getUserEvents);

// Subscription history
router.get('/history/:email', getSubscriptionHistory);

export default router;