import express, { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createCheckout,
  getPayment,
  paymentsHistory,
} from "../controller/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/checkout/qrph", protectRoute, createCheckout);

paymentRouter.post("/history", protectRoute, paymentsHistory);

paymentRouter.post("/:paymentId", protectRoute, getPayment);

export default paymentRouter;
