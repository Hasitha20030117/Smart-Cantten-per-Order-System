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
const PORT = process.env.PORT || 5000;

// ✅ Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const URL = process.env.MONGODB_URL;

mongoose
  .connect(URL)
  .then(() => console.log("✅ MongoDB connection successful"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ========== EXISTING ROUTES ==========
import userRoutes from "./routes/UserManagement/User.js";
import paymentRoutes from "./routes/Canteen/paymentRoutes.js";
import adminPaymentRoutes from "./routes/Canteen/adminPaymentRoutes.js";
import receiptRoutes from "./routes/Canteen/receiptRoutes.js";
import tokenRoutes from "./routes/Canteen/tokenRoutes.js";
import bulkOrderRoutes from "./routes/Bulk/bulkOrderRoutes.js";
import subscriptionRoutes from "./routes/Bulk/subscriptionRoutes.js";
import orderManagementRoutes from "./routes/OrderManagement/orderRoutes.js";
app.use("/user", userRoutes);

// ========== BULK ORDERING ROUTES ==========
import bulkOrderRoutes from "./routes/bulkOrder.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

app.use("/api/bulk-order", bulkOrderRoutes);
app.use("/api/subscription", subscriptionRoutes);

// ========== HEALTH CHECK ENDPOINT ==========
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Smart Canteen API is running",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// ========== ERROR HANDLING MIDDLEWARE ==========
app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);
  
  const statusCode = err.status || 500;
  const message = err.message || "Something went wrong!";
  
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === "development" ? err.message : {},
    stack: process.env.NODE_ENV === "development" ? err.stack : null
  });
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      user: "/user",
      bulkOrder: "/api/bulk-order",
      subscription: "/api/subscription",
      health: "/api/health"
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`\n📋 Available Routes:`);
  console.log(`   - /user                    (User Management)`);
  console.log(`   - POST   /api/bulk-order/create-event`);
  console.log(`   - GET    /api/bulk-order/menu`);
  console.log(`   - POST   /api/bulk-order/select-meal`);
  console.log(`   - GET    /api/bulk-order/group/:groupId`);
  console.log(`   - GET    /api/bulk-order/order/:token`);
  console.log(`   - POST   /api/bulk-order/join-group`);
  console.log(`   - GET    /api/subscription/plans`);
  console.log(`   - POST   /api/subscription/subscribe`);
  console.log(`   - GET    /api/subscription/check/:email`);
  console.log(`\n🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? "Connected" : "Connecting..."}`);
});
