import mongoose from "mongoose";

const orderManagementSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    canteen: {
      type: String,
      required: true,
      enum: ["Juice Bar", "Basement Canteen", "New Canteen", "Anohana Canteen"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    tokenNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const OrderManagementOrder = mongoose.model("OrderManagementOrder", orderManagementSchema);

export default OrderManagementOrder;
