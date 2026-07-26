import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { itemSchema } from "../schemas/cart.schema.js";
import {
  addToCart,
  deleteItem,
  getCart,
  toggleQuantity,
  clearCart,
  changeItemNote,
} from "../controller/cart.controller.js";

const cartRouter = Router();

cartRouter.get("/", protectRoute, getCart);
cartRouter.post("/", protectRoute, validate(itemSchema), addToCart);
cartRouter.post("/note", protectRoute, changeItemNote);
cartRouter.post("/toggle-quantity", protectRoute, toggleQuantity);
cartRouter.delete("/", protectRoute, deleteItem);
cartRouter.delete("/clear-cart", protectRoute, clearCart);

export default cartRouter;
