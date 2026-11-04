import express from "express";
import crypto from "crypto";
import { PAYMONGO_WEBHOOK_SECRET } from "../config/envVars.js";

const router = express.Router();

router.post(
  "/paymongo-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["paymongo-signature"];
      const secret = PAYMONGO_WEBHOOK_SECRET;

      if (!secret) {
        throw new Error(
          "PAYMONGO_WEBHOOK_SECRET is required in environment variables",
        );
      }

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body.toString())
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return res.status(401).send("Invalid signature");
      }

      const event = JSON.parse(req.body.toString());
      const eventType = event.data?.type;

      console.log(`📨 Webhook received: ${eventType}`);

      switch (eventType) {
        case "payment.paid":
          const paymentIntentId = event.data.attributes.data.id;
          console.log(`✅ Payment succeeded for: ${paymentIntentId}`);

          break;

        case "payment.failed":
          console.log(`❌ Payment failed:`, event.data.attributes.data);

          break;

        case "qrph.expired":
          console.log(`⏰ QR code expired for:`, event.data.attributes.data);

          break;

        case "payment.refunded":
          console.log(`💰 Payment refunded:`, event.data.attributes.data);

          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${eventType}`);
      }

      res.status(200).send("Webhook received successfully");
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Webhook processing failed");
    }
  },
);

export default router;
