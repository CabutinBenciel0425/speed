import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getOrders,
  getOrder,
  createOrderForCOD,
  cancelOrderCustomer,
} from "../controller/order.controller.js";

const orderRouter = Router();

orderRouter.post("/checkout/cod", protectRoute, createOrderForCOD);
orderRouter.get("/", protectRoute, getOrders);
orderRouter.post("/:orderId", protectRoute, getOrder);
orderRouter.patch("/:orderId/cancel", protectRoute, cancelOrderCustomer);
orderRouter.patch("/:orderId/cancel", protectRoute, cancelOrderCustomer);

export default orderRouter;
