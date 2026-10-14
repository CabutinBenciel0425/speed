import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getOrders,
  getOrder,
  createOrderForCOD,
  cancelOrderCustomer,
  retryDriverSearch,
  existingOrder,
} from "../controller/order.controller.js";

const orderRouter = Router();

//customer route
orderRouter.get("/existing", protectRoute, existingOrder);

orderRouter.post("/checkout/cod", protectRoute, createOrderForCOD);
orderRouter.get("/", protectRoute, getOrders);
orderRouter.get("/:orderId", protectRoute, getOrder);
orderRouter.patch("/:orderId/cancel", protectRoute, cancelOrderCustomer);
orderRouter.patch(
  "/:orderId/retry-driver-search",
  protectRoute,
  retryDriverSearch,
);

export default orderRouter;
