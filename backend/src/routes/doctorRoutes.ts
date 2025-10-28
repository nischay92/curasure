import { Router } from "express";
import { Doctor } from "../models/Doctor.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireRole } from "../middleware/roles.js";

export const doctorRoutes = Router();

const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const requireText = (value: unknown, fieldName: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return value.trim();
};

const serializeDoctor = (doctor: Awaited<ReturnType<typeof Doctor.findOne>>) => {
  if (!doctor) {
    return null;
  }

  return {
    id: doctor._id,
    userId: doctor.userId,
    specialty: doctor.specialty,
    licenseNumber: doctor.licenseNumber,
    npiNumber: doctor.npiNumber,
    yearsExperience: doctor.yearsExperience,
    clinicName: doctor.clinicName,
    bio: doctor.bio,
    phone: doctor.phone,
    addressLine1: doctor.addressLine1,
    city: doctor.city,
    state: doctor.state,
    zipCode: doctor.zipCode,
    languages: doctor.languages,
    acceptedInsurance: doctor.acceptedInsurance,
    consultationModes: doctor.consultationModes,
    verificationStatus: doctor.verificationStatus,
    updatedAt: doctor.updatedAt
  };
};

doctorRoutes.use(requireAuth, requireRole("doctor"));

doctorRoutes.get("/me", async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user?._id });

    res.status(200).json({
      doctor: serializeDoctor(doctor)
    });
  } catch (error) {
    next(error);
  }
});

doctorRoutes.put("/me", async (req, res, next) => {
  try {
    const yearsExperience = Number(req.body?.yearsExperience);

    if (!Number.isFinite(yearsExperience) || yearsExperience < 0) {
      throw new AppError("yearsExperience must be a positive number", 400);
    }

    const consultationModes = toStringArray(req.body?.consultationModes);

    if (consultationModes.length === 0) {
      throw new AppError("At least one consultation mode is required", 400);
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user?._id },
      {
        $set: {
          specialty: requireText(req.body?.specialty, "specialty"),
          licenseNumber: requireText(req.body?.licenseNumber, "licenseNumber"),
          npiNumber:
            typeof req.body?.npiNumber === "string" && req.body.npiNumber.trim()
              ? req.body.npiNumber.trim()
              : undefined,
          yearsExperience,
          clinicName: requireText(req.body?.clinicName, "clinicName"),
          bio: requireText(req.body?.bio, "bio"),
          phone: requireText(req.body?.phone, "phone"),
          addressLine1: requireText(req.body?.addressLine1, "addressLine1"),
          city: requireText(req.body?.city, "city"),
          state: requireText(req.body?.state, "state").toUpperCase(),
          zipCode: requireText(req.body?.zipCode, "zipCode"),
          languages: toStringArray(req.body?.languages),
          acceptedInsurance: toStringArray(req.body?.acceptedInsurance),
          consultationModes,
          verificationStatus: "pending"
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      doctor: serializeDoctor(doctor)
    });
  } catch (error) {
    next(error);
  }
});
