import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set. Using in-memory demo storage.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn("MongoDB connection failed. Falling back to in-memory demo storage.");
    console.warn(error.message);
    return false;
  }
}
