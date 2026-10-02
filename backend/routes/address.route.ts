import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getAllAddress,
  addAddress,
  toggleIsDefault,
  updateAddress,
  deleteAddress,
} from "../controller/address.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  addressInputSchema,
  updateSchemaInput,
} from "../schemas/address.schema.js";

const addressRouter = Router();

addressRouter.get("/", protectRoute, getAllAddress);

addressRouter.post("/", protectRoute, validate(addressInputSchema), addAddress);
addressRouter.patch(
  "/",
  protectRoute,
  validate(updateSchemaInput),
  updateAddress,
);
addressRouter.patch("/:addressType", protectRoute, toggleIsDefault);
addressRouter.delete("/:addressType", protectRoute, deleteAddress);

export default addressRouter;
