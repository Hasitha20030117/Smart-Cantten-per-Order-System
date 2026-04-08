import express from "express";
import {
  createEvent,
  getGroupOrders,
  getMenu,
  getOrderByToken,
  joinGroup,
  selectMeal,
} from "../../controllers/Bulk/bulkOrderController.js";

const router = express.Router();

router.post("/create-event", createEvent);
router.get("/menu", getMenu);
router.post("/select-meal", selectMeal);
router.get("/group/:groupId", getGroupOrders);
router.get("/order/:token", getOrderByToken);
router.post("/join-group", joinGroup);

export default router;
