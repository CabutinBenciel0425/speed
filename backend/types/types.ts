import type { merchantInput } from "../schemas/merchant.schema.js";
import type { SignupInput, UpdateInput } from "../schemas/user.schema.js";
import type { IUser } from "./user.types.js";
//customer
export type CreateCustomerInput = SignupInput & {
  avatar?: Express.Multer.File | undefined;
};
export type UpdateCustomerInput = UpdateInput & {
  avatar?: Express.Multer.File | undefined;
};

//merchant
export type CreateMerchantInput = merchantInput & {
  logo?: Express.Multer.File | undefined;
  banner?: Express.Multer.File | undefined;
};
// export type UpdateMerchantInput = UpdateInput & {
//   avatar?: Express.Multer.File | undefined;
// };
