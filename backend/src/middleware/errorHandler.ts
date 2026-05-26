import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message =
    error instanceof AppError || env.nodeEnv === "development"
      ? error.message
      : "Internal server error";

  res.status(statusCode).json({
    error: {
      message,
      statusCode
    }
  });
};

