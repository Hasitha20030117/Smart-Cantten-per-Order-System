import express from "express";
import { getReceipt } from "../../controllers/Canteen/paymentController.js";

const router = express.Router();

router.get("/:paymentId", getReceipt);

export default router;
