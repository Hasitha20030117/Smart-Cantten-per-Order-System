import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  getOrdersBySlot,
  updateOrder,
  updateOrderStatus,
} from "../../controllers/OrderManagement/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/slot", getOrdersBySlot);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;
