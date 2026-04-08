import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
  confirmOnlinePayment,
  getPayment,
  listPayments,
  startPayment,
  uploadProof,
} from "../../controllers/Canteen/paymentController.js";
import { optionalAuth } from "../../middleware/Canteen/optionalAuth.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "BACKEND", process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `proof-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
  const extname = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(extname)) {
    return cb(null, true);
  }

  cb(new Error("Only .jpg, .jpeg, .png, and .pdf files are allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

router.use(optionalAuth);
router.get("/", listPayments);
router.post("/start", startPayment);
router.post("/confirm-online", confirmOnlinePayment);
router.post("/upload-proof", upload.single("proofFile"), uploadProof);
router.get("/:paymentId", getPayment);

export default router;
