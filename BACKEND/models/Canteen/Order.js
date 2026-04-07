import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: null,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    sourceOrderId: {
      type: String,
      default: null,
      index: true,
    },
    sourceType: {
      type: String,
      default: null,
    },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    tokenRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PAID", "EXPIRED"],
      default: "PENDING_PAYMENT",
      index: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: 1 });

const Order = mongoose.model("CanteenOrder", orderSchema);

export default Order;
