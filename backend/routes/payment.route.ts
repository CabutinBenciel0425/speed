import express, { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createCheckout,
  getPayment,
  getPendingQRPhPayment,
  paymentsHistory,
} from "../controller/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/checkout/qrph", protectRoute, createCheckout);
paymentRouter.get(
  "/checkout/qrph/pending",
  protectRoute,
  getPendingQRPhPayment,
);

paymentRouter.post("/history", protectRoute, paymentsHistory);

paymentRouter.get("/:paymentId", protectRoute, getPayment);
paymentRouter.post("/:paymentId", protectRoute, getPayment);

export default paymentRouter;
