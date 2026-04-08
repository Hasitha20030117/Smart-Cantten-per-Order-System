import express from "express";
import {
  approvePayment,
  getPayments,
  rejectPayment,
} from "../../controllers/Canteen/adminController.js";
import { optionalAuth } from "../../middleware/Canteen/optionalAuth.js";
import { requireAdmin } from "../../middleware/Canteen/requireAdmin.js";

const router = express.Router();

router.use(optionalAuth);
router.use(requireAdmin);
router.get("/payments", getPayments);
router.patch("/payments/:paymentId/approve", approvePayment);
router.patch("/payments/:paymentId/reject", rejectPayment);

export default router;
