import { ValidationError } from "./../utils/errors.js";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { z, ZodError, ZodType } from "zod";

export const validate = <T>(schema: ZodType<T>): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));
        next(new ValidationError(errors));
      } else {
        next(error);
      }
    }
  };
};
