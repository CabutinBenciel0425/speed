import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError } from "../utils/errors.js";
import { ACCESS_TOKEN_SECRET_KEY } from "../config/envVars.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import type { IUser, UserDocument } from "../types/user.types.js";

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const protectRoute = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (!ACCESS_TOKEN_SECRET_KEY) {
      throw new Error(
        "ACCESS_TOKEN_SECRET_KEY is required in environment varibles",
      );
    }

    const decoded = jwt.verify(
      accessToken,
      ACCESS_TOKEN_SECRET_KEY,
    ) as JwtPayload;

    if (!decoded) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    req.user = user as UserDocument;

    next();
  },
);

export const customersOnly = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (user.role !== "Customer") {
      throw new UnauthorizedError(
        "You are not authorized on this endpoint. Customers only",
      );
    }
    next();
  },
);

export const restaurantOwnerOnly = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (user.role !== "RestaurantOwner") {
      throw new UnauthorizedError(
        "You are not authorized on this endpoint. RestaurantOwners only",
      );
    }
    next();
  },
);

export const driverOnly = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (user.role !== "Driver") {
      throw new UnauthorizedError(
        "You are not authorized on this endpoint. Drivers only",
      );
    }
    next();
  },
);

export const adminOnly = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (user.role !== "Admin") {
      throw new UnauthorizedError(
        "You are not authorized on this endpoint. Admin only",
      );
    }
    next();
  },
);
