import type { Socket } from "socket.io";
import type {
  DriverInput,
  DriverUpdateInput,
} from "../schemas/driver.schema.js";
import type { merchantInput } from "../schemas/merchant.schema.js";
import type { SignupInput, UpdateInput } from "../schemas/user.schema.js";

type ActiveRole = "Customer" | "Merchant" | "Driver" | "Admin";

export interface AuthenticatedSocket extends Socket {
  activeRole?: ActiveRole;
}

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

export type UpdateDriverInputWithImage = DriverUpdateInput & {
  avatar?: Express.Multer.File | undefined;
};

export type AddressType = "Home" | "Work" | "Other" | undefined;
