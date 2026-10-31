import mongoose from "mongoose";
import dotenv from "dotenv";
import Merchant from "../models/merchant.model.js";

dotenv.config();

const FIELDS_TO_REMOVE = [
  "now",
  "dayNumber",
  "dayName",
  "todayHours",
  "openMinutes",
  "closeMinutes",
  "currentMinutes",
  "isOpenComputed",
] as const;

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const unsetObj = FIELDS_TO_REMOVE.reduce<Record<string, "">>(
      (acc, field) => {
        acc[field] = "";
        return acc;
      },
      {},
    );

    const result = await Merchant.updateMany({}, { $unset: unsetObj });

    console.log(
      `✅ Cleaned stray fields off ${result.modifiedCount} merchant document(s)`,
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
};

cleanup();
