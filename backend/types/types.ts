import type { SignupInput, UpdateInput } from "../schemas/user.schema.js";
import type { IUser } from "./user.types.js";

export type CreateCustomerInput = SignupInput & {
  avatar?: Express.Multer.File | undefined;
};
export type UpdateCustomerInput = UpdateInput & {
  avatar?: Express.Multer.File | undefined;
};
