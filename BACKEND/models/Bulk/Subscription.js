import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, lowercase: true },
    userName: { type: String, required: true },
    plan: { type: String, enum: ["monthly", "yearly"], required: true },
    price: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
    autoRenew: { type: Boolean, default: true },
    priorityAccess: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("BulkSubscription", subscriptionSchema);

export default Subscription;
