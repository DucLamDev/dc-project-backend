import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    allowedPlusOnes: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const Guest = mongoose.model("Guest", guestSchema);
