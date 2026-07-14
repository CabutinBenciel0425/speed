import type { SignupInput } from "../schemas/user.schema.js";

export type CreateCustomerInput = SignupInput & {
  avatar?: Express.Multer.File | undefined;
};
