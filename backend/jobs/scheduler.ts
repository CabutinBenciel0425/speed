import cron from "node-cron";
import { updateMerchantOpenStatus } from "./merchant-status.job.js";

const runUpdate = async () => {
  console.log("🔄 Running merchant open status update...");
  try {
    await updateMerchantOpenStatus();
    console.log("✅ Merchant open status updated.");
  } catch (error) {
    console.error("❌ Failed to update merchant status:", error);
  }
};

export const startScheduler = () => {
  // Run once immediately on boot so status is correct right away, instead of
  // waiting up to 5 minutes after every deploy/restart.
  void runUpdate();

  // Then keep it fresh every 5 minutes.
  cron.schedule("*/5 * * * *", runUpdate, {
    timezone: "Asia/Manila",
  });

  console.log("⏰ Scheduler started (merchant status every 5 min).");
};
