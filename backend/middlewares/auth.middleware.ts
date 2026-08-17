import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError } from "../utils/errors.js";
import { ACCESS_TOKEN_SECRET_KEY } from "../config/envVars.js";
import User, { type UserDocument } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import type { ValidUserRoleInput } from "../schemas/user.schema.js";

interface JwtPayload {
  userId: string;
  activeRole: ValidUserRoleInput;
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

    if (user.isDeleted) {
      throw new UnauthorizedError("Account has been deactivated");
    }

    req.user = user as UserDocument;
    req.userRole = decoded.activeRole;
    console.log(user);
    console.log(decoded.activeRole);
    next();
  },
);

export const customersOnly = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userRole = req.userRole;

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (userRole !== "Customer") {
      throw new UnauthorizedError(
        "You are not authorized on this endpoint. Customers only",
      );
    }
    next();
  },
);

export const merchantOnly = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userRole = req.userRole;

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (userRole !== "Merchant") {
      throw new UnauthorizedError(
        "You are not authorized on this endpoint. Merchant only",
      );
    }
    next();
  },
);

export const driverOnly = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userRole = req.userRole;

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (userRole !== "Driver") {
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
    const userRole = req.userRole;
    console.log(req.user, req.userRole);

    if (!user) {
      throw new UnauthorizedError("Not authenticated. Please log in");
    }

    if (userRole !== "Admin") {
      throw new UnauthorizedError(
        "You are not authorized on this endpoint. Admin only",
      );
    }
    next();
  },
);
