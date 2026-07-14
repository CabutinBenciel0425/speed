import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
