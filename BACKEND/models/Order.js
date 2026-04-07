import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  groupName: String,
  eventName: String,
  memberName: { type: String, required: true },
  memberEmail: { type: String, required: true, lowercase: true },
  meal: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  mealName: String,
  mealPrice: Number,
  tokenNumber: { type: String, unique: true, sparse: true },
  isPriority: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'], default: 'pending' },
  specialInstructions: String,
  createdAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  if (!this.tokenNumber) {
    const prefix = this.isPriority ? 'PRI' : 'REG';
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.tokenNumber = `${prefix}-${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;