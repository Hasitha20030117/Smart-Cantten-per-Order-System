import express from "express";
import { verifyToken } from "../../controllers/Canteen/tokenController.js";

const router = express.Router();

router.get("/:tokenRef", verifyToken);

export default router;
