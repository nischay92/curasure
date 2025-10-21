import type { RequestHandler } from "express";
import { firebaseAuth } from "../config/firebaseAdmin.js";
import { AppError } from "./errorHandler.js";
import { User } from "../models/User.js";

const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
};

export const verifyFirebaseToken: RequestHandler = async (req, _res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError("Authentication token is required", 401);
    }

    const decodedToken = await firebaseAuth().verifyIdToken(token);
    req.auth = decodedToken;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Invalid or expired authentication token", 401));
  }
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    await new Promise<void>((resolve, reject) => {
      verifyFirebaseToken(req, _res, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    if (!req.auth) {
      throw new AppError("Authentication token is required", 401);
    }

    const user = await User.findOne({ firebaseUid: req.auth.uid });

    if (!user || !user.isActive) {
      throw new AppError("User profile not found or inactive", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Invalid or expired authentication token", 401));
  }
};
