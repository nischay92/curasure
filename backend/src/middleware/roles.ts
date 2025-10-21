import type { RequestHandler } from "express";
import type { UserRole } from "../models/User.js";
import { AppError } from "./errorHandler.js";

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authenticated user is required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("You do not have access to this resource", 403));
      return;
    }

    next();
  };
};
