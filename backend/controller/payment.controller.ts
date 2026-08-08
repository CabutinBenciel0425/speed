import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import type { Request, Response } from "express";
import { UnauthorizedError } from "../utils/errors.js";
import {
  createCheckoutService,
  handleExpiredQRPhPaymentService,
  handleFailedPaymentService,
  handleSuccessfulPaymentService,
} from "../services/payment.service.js";
import { PAYMONGO_WEBHOOK_SECRET } from "../config/envVars.js";

export const createCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Unauthorized user");
    }

    const newPayment = await createCheckoutService(user._id.toString());

    res.json({
      success: true,
      data: newPayment,
    });
  },
);

export const paymongoWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const secret = PAYMONGO_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error(
        "PAYMONGO_WEBHOOK_SECRET is required in environment variables",
      );
    }

    const rawBody = req.body as Buffer;

    const signatureHeader = req.headers["paymongo-signature"];

    if (!signatureHeader || Array.isArray(signatureHeader)) {
      return res.status(401).send("Missing signature");
    }

    const parts = signatureHeader.split(",");

    const timestamp = parts
      .find((part) => part.startsWith("t="))
      ?.split("=")[1];

    const testSignature = parts
      .find((part) => part.startsWith("te="))
      ?.split("=")[1];

    const liveSignature = parts
      .find((part) => part.startsWith("li="))
      ?.split("=")[1];

    if (!timestamp) {
      return res.status(401).send("Invalid signature: missing timestamp");
    }

    const signatureToCompare = testSignature || liveSignature;

    if (!signatureToCompare) {
      return res.status(401).send("Invalid signature: missing signature");
    }

    const signaturePayload = `${timestamp}.${rawBody.toString("utf8")}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signaturePayload)
      .digest("hex");

    if (signatureToCompare !== expectedSignature) {
      console.error("Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    const eventType = event.data?.type;

    console.log(`📨 PayMongo webhook: ${eventType}`);

    console.log("RAW BODY:", req.body.toString());
    console.log("SIGNATURE:", signatureHeader);
    console.log("EVENT:", event);
    console.log("EVENT TYPE:", eventType);

    switch (eventType) {
      case "payment.paid": {
        const paymentIntentId = event.data.attributes.data.payment_intent_id;

        const transactionId = event.data.attributes.data.id;

        console.log(`✅ Payment succeeded: ${paymentIntentId}`);

        const order = await handleSuccessfulPaymentService(
          paymentIntentId,
          transactionId,
        );

        return res.status(200).json({
          success: true,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
          },
        });
      }

      case "payment.failed": {
        console.log("❌ Payment failed");
        const paymentIntentId = event.data.attributes.data.payment_intent_id;

        const payment = await handleFailedPaymentService(paymentIntentId);

        return res.status(200).json({
          success: true,
          message: "Payment failed",
          data: payment,
        });
      }

      case "qrph.expired": {
        console.log("⏰ QRPh expired");
        const paymentIntentId = event.data.attributes.data.payment_intent_id;

        const payment = await handleExpiredQRPhPaymentService(paymentIntentId);

        return res.status(200).json({
          success: true,
          message: "QR expired",
          data: payment,
        });
      }

      case "payment.refunded": {
        console.log("💰 Payment refunded");
        break;
      }

      default: {
        console.log(`ℹ️ Unhandled event: ${eventType}`);
      }
    }
  },
);
