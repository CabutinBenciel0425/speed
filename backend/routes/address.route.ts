import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  addAddress,
  toggleIsDefault,
  updateAddress,
} from "../controller/address.controller.js";

const addressRouter = Router();

addressRouter.post("/", protectRoute, addAddress);
addressRouter.patch("/", protectRoute, updateAddress);
addressRouter.patch("/:addressType", protectRoute, toggleIsDefault);

//TODO: toggleIsDefault (only 1 must be true), deleteAddress

export default addressRouter;
