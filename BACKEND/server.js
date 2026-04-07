import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import Order from "./models/Canteen/Order.js";
import Payment from "./models/Canteen/Payment.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

// ✅ Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
  origin: process.env.CLIENT_URL, // http://localhost:3000
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const URL = process.env.MONGODB_URL;

// routes
import userRoutes from "./routes/UserManagement/User.js";
import paymentRoutes from "./routes/Canteen/paymentRoutes.js";
import adminPaymentRoutes from "./routes/Canteen/adminPaymentRoutes.js";
import receiptRoutes from "./routes/Canteen/receiptRoutes.js";
import tokenRoutes from "./routes/Canteen/tokenRoutes.js";
import bulkOrderRoutes from "./routes/Bulk/bulkOrderRoutes.js";
import subscriptionRoutes from "./routes/Bulk/subscriptionRoutes.js";
import orderManagementRoutes from "./routes/OrderManagement/orderRoutes.js";
app.use("/user", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminPaymentRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/verify-token", tokenRoutes);
app.use("/api/bulk-order", bulkOrderRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/orders", orderManagementRoutes);

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Smart Canteen API is running",
    timestamp: new Date(),
  });
});

const PAYMENT_EXPIRE_MINUTES = parseInt(process.env.PAYMENT_EXPIRE_MINUTES || "15", 10);

const autoExpireOrders = async () => {
  try {
    const expireThreshold = new Date(Date.now() - PAYMENT_EXPIRE_MINUTES * 60 * 1000);
    const ordersToExpire = await Order.find({
      status: "PENDING_PAYMENT",
      createdAt: { $lt: expireThreshold },
    });

    if (ordersToExpire.length === 0) return;

    for (const order of ordersToExpire) {
      order.status = "EXPIRED";
      await order.save();

      await Payment.updateMany(
        {
          orderId: order._id,
          status: { $in: ["PENDING", "UNDER_REVIEW"] },
        },
        { $set: { status: "EXPIRED" } }
      );
    }
  } catch (error) {
    console.error("Auto-expire error:", error);
  }
};

const startServer = async () => {
  if (!URL) {
    console.error("MongoDB connection error: MONGODB_URL is not set in BACKEND/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(URL);
    console.log("MongoDB connection successful");

    cron.schedule("*/5 * * * *", autoExpireOrders);
    setTimeout(autoExpireOrders, 5000);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();
