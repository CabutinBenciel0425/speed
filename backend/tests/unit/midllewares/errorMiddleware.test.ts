import jwt from "jsonwebtoken";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../../utils/errors";
import { errorMiddleware } from "../../../middlewares/error.middleware";
import { ApiError } from "../../../utils/apiError";

const env = vi.hoisted(() => ({ NODE_ENV: "test" as string | undefined }));

vi.mock("../../../config/envVars", () => ({
  get NODE_ENV() {
    return env.NODE_ENV;
  },
}));

const makeRes = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
};

const getExpiredTokenError = (): Error => {
  try {
    jwt.verify(jwt.sign({}, "secret", { expiresIn: -10 }), "secret");
  } catch (error) {
    return error as Error;
  }
  throw new Error("expected jwt.verify to throw for an expired token");
};

describe("errorMiddleware tests", () => {
  beforeEach(() => {
    env.NODE_ENV = "test";

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("answers 404 for a NotFoundError", () => {
    const res = makeRes();

    errorMiddleware(
      new NotFoundError("Order"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Order not found",
      errors: [],
    });
  });

  test("answers 401 for a UnauthorizedError", () => {
    const res = makeRes();

    errorMiddleware(
      new UnauthorizedError("Unknown user"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unknown user",
      errors: [],
    });
  });

  test("answers 409 for a ConflictError", () => {
    const res = makeRes();

    errorMiddleware(
      new ConflictError("Invalid input"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid input",
      errors: [],
    });
  });

  test("answers custom error for an apiError", () => {
    const res = makeRes();

    errorMiddleware(
      new ApiError(423, "Custom error message"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(423);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Custom error message",
      errors: [],
    });
  });

  test("answers Mongoose CastError", () => {
    const res = makeRes();
    const error = new Error();
    error.name = "CastError";
    errorMiddleware(
      error,
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid ID format",
      errors: [],
    });
  });

  test("answers Validation Error", () => {
    const res = makeRes();
    const error = new Error() as any;
    error.name = "ValidationError";
    errorMiddleware(
      error,
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation Failed",
      errors: [],
    });
  });

  test("answers Mongoose Duplicate Key Error", () => {
    const res = makeRes();
    const error = new Error() as any;
    error.code = 11000;
    errorMiddleware(
      error,
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Duplicate value for field",
      errors: [
        {
          code: "DUPLICATE",
          field: "field",
          message: "Already exists",
        },
      ],
    });
  });

  test("answers 401 and 'Invalid token' for a JsonWebTokenError", () => {
    const res = makeRes();

    errorMiddleware(
      new jwt.JsonWebTokenError("jwt malformed"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
      errors: [],
    });
  });

  test("answers 401 and 'Token expired' for a TokenExpiredError", () => {
    const res = makeRes();

    errorMiddleware(
      getExpiredTokenError(),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token expired",
      errors: [],
    });
  });

  test("answers 400 and Multer's own message for a MulterError", () => {
    const res = makeRes();

    errorMiddleware(
      new multer.MulterError("LIMIT_FILE_SIZE"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "File too large",
      errors: [],
    });
  });

  test("answers 500 with the real message for an unhandled Error", () => {
    const res = makeRes();

    errorMiddleware(
      new Error("boom"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "boom",
      errors: [],
    });
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  test("answers 500 'Unknown error' when the error has no message", () => {
    const res = makeRes();

    errorMiddleware(
      new Error(),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unknown error",
      errors: [],
    });
  });

  test("development: includes the stack trace", () => {
    env.NODE_ENV = "development";
    const res = makeRes();

    errorMiddleware(
      new NotFoundError("Order"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    const body = res.json.mock.calls[0]?.[0];
    expect(res.status).toHaveBeenCalledWith(404);
    expect(typeof body.stack).toBe("string");
  });

  test("development: an unhandled error shows its real message", () => {
    env.NODE_ENV = "development";
    const res = makeRes();

    errorMiddleware(
      new Error("boom"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    const body = res.json.mock.calls[0]?.[0];
    expect(body.message).toBe("boom");
    expect(typeof body.stack).toBe("string");
  });

  test("production: hides the stack for a known error", () => {
    env.NODE_ENV = "production";
    const res = makeRes();

    errorMiddleware(
      new NotFoundError("Order"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    const body = res.json.mock.calls[0]?.[0];
    expect(res.status).toHaveBeenCalledWith(404);
    expect(body.message).toBe("Order not found");
    expect(body.stack).toBeUndefined();
  });

  test("production: an unhandled error does not leak its message or stack", () => {
    env.NODE_ENV = "production";
    const res = makeRes();

    errorMiddleware(
      new Error("db password is 1234"),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    );

    const body = res.json.mock.calls[0]?.[0];
    expect(res.status).toHaveBeenCalledWith(500);
    expect(body.message).toBe("Internal Server Error");
    expect(body.stack).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("db password");
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
