import cron from "node-cron";
import { updateMerchantOpenStatus } from "./merchant-status.job.js";

const runUpdate = async () => {
  try {
    await updateMerchantOpenStatus();
    console.log("✅ Merchant open status updated.");
  } catch (error) {
    console.error("❌ Failed to update merchant status:", error);
  }
};

export const startScheduler = () => {
  void runUpdate();

  cron.schedule("*/3 * * * *", runUpdate, {
    timezone: "Asia/Manila",
  });
};
