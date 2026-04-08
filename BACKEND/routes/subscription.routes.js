import express from 'express';
import { getPlans, createSubscription, checkSubscription } from '../controllers/subscription.controller.js';

const router = express.Router();

router.get('/plans', getPlans);
router.post('/subscribe', createSubscription);
router.get('/check/:email', checkSubscription);

export default router;