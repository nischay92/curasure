import { Router } from "express";
import { z } from "zod";
import { AuditLog } from "../models/AuditLog.js";
import { Doctor } from "../models/Doctor.js";
import { InsuranceProvider } from "../models/InsuranceProvider.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validateBody } from "../middleware/validate.js";
import { writeAuditLog } from "../services/auditService.js";

export const adminRoutes = Router();

const verificationSchema = z.object({
  status: z.enum(["pending", "verified", "rejected"])
});

adminRoutes.use(requireAuth, requireRole("admin"));

adminRoutes.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

adminRoutes.get("/doctors", async (_req, res, next) => {
  try {
    const doctors = await Doctor.find().populate("userId", "email displayName role").sort({ updatedAt: -1 });
    res.status(200).json({ doctors });
  } catch (error) {
    next(error);
  }
});

adminRoutes.patch("/doctors/:doctorId/verification", validateBody(verificationSchema), async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.doctorId,
      { $set: { verificationStatus: req.body.status } },
      { new: true }
    );
    await writeAuditLog({
      actorUserId: req.user?._id,
      action: "doctor.verification.updated",
      targetType: "doctor",
      targetId: doctor?._id,
      metadata: { status: req.body.status }
    });
    res.status(200).json({ doctor });
  } catch (error) {
    next(error);
  }
});

adminRoutes.get("/insurance-providers", async (_req, res, next) => {
  try {
    const providers = await InsuranceProvider.find().populate("userId", "email displayName role").sort({ updatedAt: -1 });
    res.status(200).json({ providers });
  } catch (error) {
    next(error);
  }
});

adminRoutes.patch(
  "/insurance-providers/:providerId/verification",
  validateBody(verificationSchema),
  async (req, res, next) => {
    try {
      const provider = await InsuranceProvider.findByIdAndUpdate(
        req.params.providerId,
        { $set: { verificationStatus: req.body.status } },
        { new: true }
      );
      await writeAuditLog({
        actorUserId: req.user?._id,
        action: "insurance_provider.verification.updated",
        targetType: "insuranceProvider",
        targetId: provider?._id,
        metadata: { status: req.body.status }
      });
      res.status(200).json({ provider });
    } catch (error) {
      next(error);
    }
  }
);

adminRoutes.get("/audit-logs", async (_req, res, next) => {
  try {
    const auditLogs = await AuditLog.find().populate("actorUserId", "email role").sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ auditLogs });
  } catch (error) {
    next(error);
  }
});
