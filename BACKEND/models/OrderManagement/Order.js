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
      enum: ["Main Canteen", "Juice Bar", "New canteen", "Anohana canteen"],
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
