import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "./errorHandler.js";

export const validateBody = (schema: ZodSchema): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError(result.error.issues[0]?.message ?? "Invalid request body", 400));
      return;
    }

    req.body = result.data;
    next();
  };
};
