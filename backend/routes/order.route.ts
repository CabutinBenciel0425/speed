import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getOrders,
  getOrder,
  createOrderForCOD,
} from "../controller/order.controller.js";

const orderRouter = Router();

orderRouter.post("/cod", protectRoute, createOrderForCOD);
orderRouter.get("/", protectRoute, getOrders);
orderRouter.post("/:orderId", protectRoute, getOrder);
// orderRouter.patch("/:orderId/cancel", protectRoute, cancelOrder);

export default orderRouter;
