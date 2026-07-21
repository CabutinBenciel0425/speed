import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getAllAddress,
  addAddress,
  toggleIsDefault,
  updateAddress,
  deleteAddress,
} from "../controller/address.controller.js";

const addressRouter = Router();

addressRouter.get("/", protectRoute, getAllAddress);
addressRouter.post("/", protectRoute, addAddress);
addressRouter.patch("/", protectRoute, updateAddress);
addressRouter.patch("/:addressType", protectRoute, toggleIsDefault);
addressRouter.delete("/:addressType", protectRoute, deleteAddress);

export default addressRouter;
