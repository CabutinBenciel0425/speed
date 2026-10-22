import mongoose from "mongoose";
import { MONGODB_URI } from "../config/envVars.js";

export const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is required in environment variables");
    }

    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error on connectDB: ${error.message}`);
    } else {
      console.log(`Error on connectDB: ${String(error)}`);
    }
    process.exit(1);
  }
};
