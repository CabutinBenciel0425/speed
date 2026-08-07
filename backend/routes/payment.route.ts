import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createCheckout } from "../controller/payment.controller.js";

const paymentRouter = Router();

// POST /payments/checkout
paymentRouter.post("/checkout", protectRoute, createCheckout);

// POST /payments/webhook

// GET /payments/history

// GET /payments/:paymentId

export default paymentRouter;
