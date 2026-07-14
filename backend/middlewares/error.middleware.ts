import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { NODE_ENV } from "../config/envVars.js";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  if (err instanceof Error && err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
      errors: [],
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  if (err instanceof Error && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || "field";
    res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
      errors: [{ field, message: "Already exists", code: "DUPLICATE" }],
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  if (err instanceof Error && err.name === "ValidationError") {
    const errors = Object.keys((err as any).errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: [],
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  if (err instanceof Error && err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      errors: [],
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  if (err instanceof Error && err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
      errors: [],
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  if (err instanceof Error && err.name === "ZodError") {
    const zodError = err as any;
    const errors = zodError.errors.map((e: any) => ({
      field: e.path.join("."),
      message: e.message,
      code: e.code,
    }));
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  if (err instanceof Error && err.name === "MulterError") {
    res.status(400).json({
      success: false,
      message: err.message,
      errors: [],
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  if (err instanceof SyntaxError && (err as any).status === 400) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      errors: [],
      stack: NODE_ENV === "development" ? err.stack : undefined,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message:
      NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Unknown error",
    errors: [],
    stack: NODE_ENV === "development" ? err.stack : undefined,
  });
};
