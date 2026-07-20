import type { DriverInput } from "../schemas/driver.schema.js";
import type { merchantInput } from "../schemas/merchant.schema.js";
import type { SignupInput, UpdateInput } from "../schemas/user.schema.js";

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

export type CreateDriverInput = DriverInput & {
  avatar?: Express.Multer.File | undefined;
};

export type AddressType = "Home" | "Work" | "Other" | undefined;
