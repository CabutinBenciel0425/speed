import type { UserDocument } from "../models/user.model.ts";
import type { ValidUserRoleInput } from "../schemas/user.schema.ts";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      userRole?: ValidUserRoleInput;
    }
  }
}

export {};
