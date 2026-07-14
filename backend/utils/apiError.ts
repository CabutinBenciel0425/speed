import { type ErrorDetail } from "../types/errorTypes.js";

export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  data: null;
  errors: ErrorDetail[];

  constructor(
    statusCode: number = 500,
    message: string = "Something went wrong. Internal Server Error",
    errors: ErrorDetail[] = [],
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
