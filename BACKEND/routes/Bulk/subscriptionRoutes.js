import express from "express";
import {
  checkSubscription,
  createSubscription,
  getPlans,
} from "../../controllers/Bulk/subscriptionController.js";

const router = express.Router();

router.get("/plans", getPlans);
router.post("/subscribe", createSubscription);
router.get("/check/:email", checkSubscription);

export default router;
