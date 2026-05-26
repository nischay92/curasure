import { Router } from "express";
import { verifyFirebaseToken, requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { User, userRoles, type UserRole } from "../models/User.js";

export const authRoutes = Router();

authRoutes.post("/profile", verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!req.auth?.email) {
      throw new AppError("Firebase account must include an email address", 400);
    }

    const requestedRole = req.body?.role as UserRole | undefined;
    const role = requestedRole ?? "patient";

    if (!userRoles.includes(role)) {
      throw new AppError("Invalid user role", 400);
    }

    const existingUser = await User.findOne({ firebaseUid: req.auth.uid });

    if (!existingUser && role === "admin") {
      throw new AppError("Admin accounts must be provisioned outside public registration", 403);
    }

    if (existingUser) {
      res.status(200).json({
        user: {
          id: existingUser._id,
          firebaseUid: existingUser.firebaseUid,
          email: existingUser.email,
          displayName: existingUser.displayName,
          role: existingUser.role,
          isActive: existingUser.isActive
        }
      });
      return;
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.auth.uid },
      {
        $setOnInsert: {
          firebaseUid: req.auth.uid,
          email: req.auth.email,
          displayName: req.auth.name,
          role
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user?._id,
      firebaseUid: req.user?.firebaseUid,
      email: req.user?.email,
      displayName: req.user?.displayName,
      role: req.user?.role,
      isActive: req.user?.isActive
    }
  });
});
