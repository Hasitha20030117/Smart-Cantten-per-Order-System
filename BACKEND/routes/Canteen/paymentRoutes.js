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
  // Accept common image formats and PDF. Some mobile devices use webp/heic/heif.
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
  ];
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".heic",
    ".heif",
    ".pdf",
  ];

  const extname = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(extname)) {
    return cb(null, true);
  }

  cb(new Error("Only image (jpg,jpeg,png,webp,heic) or pdf files are allowed"));
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
