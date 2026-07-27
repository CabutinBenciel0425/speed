import { BCRYPT_SALT_ROUNDS } from "./../config/constants.js";
import { model, Schema, Document } from "mongoose";

import bcrypt from "bcryptjs";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: [string];
  avatar: string;
  isVerified: boolean;
  isDeleted: boolean;
  comparePassword(password: string): Promise<boolean>;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      min: [8, "Password must be atleast 8 characters long"],
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: [String],
      required: true,
      enum: ["Customer", "Merchant", "Driver", "Admin"],
      default: ["Customer"],
    },
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre(/^find/, function (this: any) {
  if (this.getOptions().includeDeleted) return;
  this.where({ isDeleted: false });
});

userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const User = model<IUser>("User", userSchema);
export default User;
