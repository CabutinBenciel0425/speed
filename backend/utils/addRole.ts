import { NotFoundError } from "./errors.js";
import User from "../models/user.model.js";

const VALID_ROLES = ["User", "Merchant", "Driver", "Admin"] as const;

export const addUserRole = async (userId: string, role: string) => {
  try {
    if (!VALID_ROLES.includes(role as any)) {
      throw new Error(
        `Invalid role: ${role}. Valid roles: ${VALID_ROLES.join(", ")}`,
      );
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { role },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error in adding role to user: ", error);
    throw error;
  }
};
