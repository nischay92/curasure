import { Router } from "express";
import { AiSession } from "../models/AiSession.js";
import { Doctor } from "../models/Doctor.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireRole } from "../middleware/roles.js";
import { generateSymptomGuidance, symptomDisclaimer } from "../services/aiSymptomService.js";

export const aiRoutes = Router();

const serializeDoctorMatch = (doctor: any) => ({
  id: doctor._id,
  clinicName: doctor.clinicName,
  specialty: doctor.specialty,
  city: doctor.city,
  state: doctor.state,
  acceptedInsurance: doctor.acceptedInsurance,
  consultationModes: doctor.consultationModes,
  verificationStatus: doctor.verificationStatus
});

aiRoutes.use(requireAuth, requireRole("patient"));

aiRoutes.post("/symptoms", async (req, res, next) => {
  try {
    const symptoms = typeof req.body?.symptoms === "string" ? req.body.symptoms.trim() : "";
    const city = typeof req.body?.city === "string" ? req.body.city.trim() : "";
    const state = typeof req.body?.state === "string" ? req.body.state.trim() : "";
    const insurance = typeof req.body?.insurance === "string" ? req.body.insurance.trim() : "";

    if (symptoms.length < 10) {
      throw new AppError("Describe symptoms in at least 10 characters", 400);
    }

    const guidance = await generateSymptomGuidance(symptoms);
    const doctorFilters: Record<string, unknown> = {
      specialty: new RegExp(guidance.recommendedSpecialty, "i")
    };

    if (city) {
      doctorFilters.city = new RegExp(city, "i");
    }

    if (state) {
      doctorFilters.state = state.toUpperCase();
    }

    if (insurance) {
      doctorFilters.acceptedInsurance = new RegExp(insurance, "i");
    }

    let doctors = await Doctor.find(doctorFilters).limit(6);

    if (doctors.length === 0) {
      doctors = await Doctor.find({
        ...(city ? { city: new RegExp(city, "i") } : {}),
        ...(state ? { state: state.toUpperCase() } : {}),
        ...(insurance ? { acceptedInsurance: new RegExp(insurance, "i") } : {})
      }).limit(6);
    }

    const session = await AiSession.create({
      patientUserId: req.user?._id,
      symptoms,
      recommendedSpecialty: guidance.recommendedSpecialty,
      urgency: guidance.urgency,
      source: guidance.source,
      guidance: guidance.guidance,
      disclaimer: symptomDisclaimer
    });

    res.status(200).json({
      session: {
        id: session._id,
        symptoms: session.symptoms,
        recommendedSpecialty: session.recommendedSpecialty,
        urgency: session.urgency,
        source: session.source,
        guidance: session.guidance,
        disclaimer: session.disclaimer
      },
      doctors: doctors.map(serializeDoctorMatch)
    });
  } catch (error) {
    next(error);
  }
});

aiRoutes.get("/symptoms/history", async (req, res, next) => {
  try {
    const sessions = await AiSession.find({ patientUserId: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
});
