import express from "express";
import {
  createOrder,
  completeOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  getOrdersBySlot,
  updateOrder,
  updateOrderStatus,
  getUserRewards,
} from "../../controllers/OrderManagement/orderController.js";
import { getUserOrders } from "../../controllers/OrderManagement/getUserOrders.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/slot", getOrdersBySlot);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.post("/complete", completeOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.get("/rewards/:userId", getUserRewards);
router.get("/user/:userId", getUserOrders);

export default router;
