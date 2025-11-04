import { Router } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { Doctor } from "../models/Doctor.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

export const appointmentRoutes = Router();

const serializeAppointment = (appointment: Awaited<ReturnType<typeof Appointment.findOne>>) => {
  if (!appointment) {
    return null;
  }

  const doctor = typeof appointment.doctorId === "object" ? appointment.doctorId : null;
  const patient = typeof appointment.patientUserId === "object" ? appointment.patientUserId : null;

  return {
    id: appointment._id,
    patientUserId:
      typeof appointment.patientUserId === "object" && "_id" in appointment.patientUserId
        ? appointment.patientUserId._id
        : appointment.patientUserId,
    patientEmail:
      patient && "email" in patient && typeof patient.email === "string" ? patient.email : undefined,
    doctorId:
      typeof appointment.doctorId === "object" && "_id" in appointment.doctorId
        ? appointment.doctorId._id
        : appointment.doctorId,
    doctorName:
      doctor && "clinicName" in doctor && typeof doctor.clinicName === "string"
        ? doctor.clinicName
        : undefined,
    specialty:
      doctor && "specialty" in doctor && typeof doctor.specialty === "string"
        ? doctor.specialty
        : undefined,
    availabilitySlotId: appointment.availabilitySlotId,
    scheduledAt: appointment.scheduledAt,
    durationMinutes: appointment.durationMinutes,
    reason: appointment.reason,
    visitMode: appointment.visitMode,
    status: appointment.status
  };
};

const serializeSlot = (slot: Awaited<ReturnType<typeof AvailabilitySlot.findOne>>) => {
  if (!slot) {
    return null;
  }

  return {
    id: slot._id,
    doctorId: slot.doctorId,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    visitMode: slot.visitMode,
    status: slot.status,
    appointmentId: slot.appointmentId
  };
};

appointmentRoutes.use(requireAuth);

appointmentRoutes.get("/slots", async (req, res, next) => {
  try {
    const doctorId = String(req.query.doctorId ?? "");

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new AppError("Valid doctorId is required", 400);
    }

    const slots = await AvailabilitySlot.find({
      doctorId,
      status: "open",
      startsAt: { $gt: new Date() }
    }).sort({ startsAt: 1 });

    res.status(200).json({
      slots: slots.map(serializeSlot)
    });
  } catch (error) {
    next(error);
  }
});

appointmentRoutes.post("/slots", async (req, res, next) => {
  try {
    if (req.user?.role !== "doctor") {
      throw new AppError("Only doctors can open availability slots", 403);
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      throw new AppError("Create your doctor profile before opening slots", 400);
    }

    const startsAt = new Date(String(req.body?.startsAt ?? ""));

    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
      throw new AppError("startsAt must be a future date and time", 400);
    }

    const minutes = startsAt.getMinutes();
    const seconds = startsAt.getSeconds();
    const milliseconds = startsAt.getMilliseconds();

    if (minutes !== 0 || seconds !== 0 || milliseconds !== 0) {
      throw new AppError("Availability slots must start on the hour", 400);
    }

    const visitMode = req.body?.visitMode === "telehealth" ? "telehealth" : "in_person";

    if (!doctor.consultationModes.includes(visitMode)) {
      throw new AppError("Your profile does not offer that visit mode", 400);
    }

    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
    const slot = await AvailabilitySlot.create({
      doctorId: doctor._id,
      doctorUserId: req.user._id,
      startsAt,
      endsAt,
      visitMode,
      status: "open"
    });

    res.status(201).json({
      slot: serializeSlot(slot)
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      next(new AppError("You already opened a slot at that time", 409));
      return;
    }

    next(error);
  }
});

appointmentRoutes.get("/", async (req, res, next) => {
  try {
    const filters =
      req.user?.role === "doctor"
        ? { doctorUserId: req.user._id }
        : { patientUserId: req.user?._id };

    const appointments = await Appointment.find(filters)
      .populate("doctorId", "clinicName specialty city state")
      .populate("patientUserId", "email displayName")
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      appointments: appointments.map(serializeAppointment)
    });
  } catch (error) {
    next(error);
  }
});

appointmentRoutes.post("/", async (req, res, next) => {
  try {
    if (req.user?.role !== "patient") {
      throw new AppError("Only patients can book appointments", 403);
    }

    const availabilitySlotId = String(req.body?.availabilitySlotId ?? "");

    if (!mongoose.Types.ObjectId.isValid(availabilitySlotId)) {
      throw new AppError("Valid availabilitySlotId is required", 400);
    }

    const slot = await AvailabilitySlot.findOneAndUpdate(
      {
        _id: availabilitySlotId,
        status: "open",
        startsAt: { $gt: new Date() }
      },
      {
        $set: {
          status: "booked"
        }
      },
      {
        new: true
      }
    );

    if (!slot) {
      throw new AppError("That slot is no longer available", 409);
    }

    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";

    if (!reason) {
      throw new AppError("reason is required", 400);
    }

    const doctor = await Doctor.findById(slot.doctorId);

    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    const appointment = await Appointment.create({
      patientUserId: req.user._id,
      doctorId: doctor._id,
      doctorUserId: doctor.userId,
      availabilitySlotId: slot._id,
      scheduledAt: slot.startsAt,
      durationMinutes: 60,
      reason,
      visitMode: slot.visitMode,
      status: "pending"
    });

    await AvailabilitySlot.findByIdAndUpdate(slot._id, {
      $set: {
        appointmentId: appointment._id
      }
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("doctorId", "clinicName specialty city state")
      .populate("patientUserId", "email displayName");

    res.status(201).json({
      appointment: serializeAppointment(populated)
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      next(new AppError("That appointment time is already booked", 409));
      return;
    }

    next(error);
  }
});
