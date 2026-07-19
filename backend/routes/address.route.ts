import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { addAddress } from "../controller/address.controller.js";

const addressRouter = Router();

addressRouter.post("/", protectRoute, addAddress);

//TODO: updateAddress, toggleIsDefault (only 1 must be true), deleteAddress

export default addressRouter;
