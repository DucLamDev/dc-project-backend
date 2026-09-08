import mongoose from "mongoose";

const rsvpSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest"
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    attendance: {
      type: String,
      enum: ["ceremony", "reception", "both", "decline"],
      required: true
    },
    partySize: {
      type: Number,
      default: 1,
      min: 0
    },
    menuChoice: {
      type: String,
      enum: ["menu1", "menu2", null],
      default: null
    },
    dietaryRequirements: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      default: ""
    },
    confirmationSentAt: Date
  },
  { timestamps: true }
);

export const RSVP = mongoose.model("RSVP", rsvpSchema);
