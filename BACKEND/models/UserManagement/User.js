

import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    profilePic: { type: String, trim: true, default: "" },

    firstName: { type: String, required: true, trim: true, minlength: 2 },

    lastName: { type: String, required: true, trim: true, minlength: 2 },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+\-() ]{7,20}$/, "Invalid phone number"],
      unique: true,
    },

    address: { type: String, required: true, trim: true },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // exclude by default in queries
    },

    role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},

    rewardPoints: {
      type: Map,
      of: Number,
      default: {},
    },

    rewardHistory: [
      {
        date: { type: Date, default: Date.now },
        action: { type: String, enum: ['Earned', 'Converted', 'Donated'], required: true },
        points: { type: Number, required: true },
        canteen: { type: String, default: 'Bulk Event' },
        amount: { type: Number, required: true },
        description: { type: String, default: '' }
      }
    ],

    lastLogin: { type: Date, default: Date.now },

    isVerified: { type: Boolean, default: false },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

UserSchema.virtual('totalRewardPoints').get(function() {
  if (this.rewardPoints instanceof Map || (this.rewardPoints && typeof this.rewardPoints.values === 'function')) {
    return Array.from(this.rewardPoints.values()).reduce((sum, points) => sum + points, 0);
  }
  return Object.values(this.rewardPoints || {}).reduce((sum, points) => sum + points, 0);
});

const User = mongoose.model("User", UserSchema);
export default User;
