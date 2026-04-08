import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CanteenOrder",
      required: false,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    tokenRef: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["ONLINE_SIM", "QR_SIM", "BANK_SLIP_SIM"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "PAID", "REJECTED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    proofUrl: {
      type: String,
      default: null,
    },
    adminNote: {
      type: String,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model("CanteenPayment", paymentSchema);

export default Payment;
