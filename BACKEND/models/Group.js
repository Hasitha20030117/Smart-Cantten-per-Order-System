import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  eventName: { type: String, required: true, trim: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, default: '12:00' },
  leaderName: { type: String, required: true },
  leaderEmail: { type: String, required: true, lowercase: true },
  numberOfGroups: { type: Number, default: 1, min: 1, max: 20 },
  maxMembersPerGroup: { type: Number, default: 12, min: 1, max: 50 },
  description: { type: String, default: '' },
  members: [{
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    mealChoice: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    mealName: String,
    token: String,
    isPriority: { type: Boolean, default: false },
    orderStatus: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed'], default: 'pending' },
    selectedAt: Date
  }],
  inviteCode: { type: String, unique: true },
  status: { type: String, enum: ['active', 'closed', 'completed', 'cancelled'], default: 'active' },
  earnedRewardPoints: { type: Number, default: 0 },
  rewardPointsAwarded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

groupSchema.pre('save', function(next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

const Group = mongoose.model('Group', groupSchema);
export default Group;