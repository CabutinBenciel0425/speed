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
  toggleIsDefaultInput,
  updateSchemaInput,
} from "../schemas/address.schema.js";

const addressRouter = Router();

addressRouter.get("/", protectRoute, getAllAddress);
addressRouter.post("/", validate(addressInputSchema), protectRoute, addAddress);
addressRouter.patch(
  "/",
  validate(updateSchemaInput),
  protectRoute,
  updateAddress,
);
addressRouter.patch(
  "/:addressType",
  validate(toggleIsDefaultInput),
  protectRoute,
  toggleIsDefault,
);
addressRouter.delete("/:addressType", protectRoute, deleteAddress);

export default addressRouter;
