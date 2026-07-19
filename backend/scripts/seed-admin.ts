import {
  ADMIN_EMAIL,
  ADMIN_PASS,
  ADMIN_PHONENUMBER,
} from "../config/envVars.js";
import User from "../models/user.model.js";

export const createDefaultAdmin = async () => {
  if (!ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL is required");
  }

  if (!ADMIN_PASS) {
    throw new Error("ADMIN_PASS is required");
  }

  if (!ADMIN_PHONENUMBER) {
    throw new Error("ADMIN_PHONENUMBER is required");
  }
  const admin = await User.findOne({ email: ADMIN_EMAIL } as { email: string });

  if (admin) return;

  await User.create({
    firstName: "System",
    lastName: "Administrator",
    email: ADMIN_EMAIL!,
    password: ADMIN_PASS!,
    phoneNumber: ADMIN_PHONENUMBER,
    role: ["Admin"],
    isVerified: true,
  });

  console.log("✅ Default admin created.");
};
