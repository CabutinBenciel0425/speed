import { type ErrorDetail } from "../types/errorTypes.js";
import { ApiError } from "./apiError.js";

export class ValidationError extends ApiError {
  constructor(errors: ErrorDetail[] = []) {
    super(400, "Validation failed", errors);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = "Resource") {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}
