import { type HydratedDocument, Model } from "mongoose";

export type UserRole = "Customer" | "RestaurantOwner" | "Driver" | "Admin";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;

  role: UserRole;

  avatar?: string;

  isVerified: boolean;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

export type UserModel = Model<IUser, {}, IUserMethods>;
