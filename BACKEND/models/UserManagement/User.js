// models/UserManagement/User.js  (ESM)

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

    lastLogin: { type: Date, default: Date.now },

    isVerified: { type: Boolean, default: false },

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
