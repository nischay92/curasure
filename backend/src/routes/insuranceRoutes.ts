import mongoose from "mongoose";
import { Router } from "express";
import { CoverageQuery } from "../models/CoverageQuery.js";
import { CoverageRule } from "../models/CoverageRule.js";
import { Doctor } from "../models/Doctor.js";
import { InsurancePlan } from "../models/InsurancePlan.js";
import { InsuranceProvider } from "../models/InsuranceProvider.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireRole } from "../middleware/roles.js";

export const insuranceRoutes = Router();

const requireText = (value: unknown, fieldName: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return value.trim();
};

const serializeProvider = (provider: any) =>
  provider
    ? {
        id: provider._id,
        companyName: provider.companyName,
        payerId: provider.payerId,
        supportPhone: provider.supportPhone,
        supportEmail: provider.supportEmail,
        website: provider.website,
        verificationStatus: provider.verificationStatus
      }
    : null;

const serializePlan = (plan: any) => ({
  id: plan._id,
  providerId: plan.providerId,
  name: plan.name,
  planType: plan.planType,
  memberServicesPhone: plan.memberServicesPhone,
  isActive: plan.isActive
});

const serializeRule = (rule: any) => ({
  id: rule._id,
  providerId: rule.providerId,
  planId: rule.planId,
  specialty: rule.specialty,
  service: rule.service,
  coverageStatus: rule.coverageStatus,
  copayAmount: rule.copayAmount,
  coinsurancePercent: rule.coinsurancePercent,
  notes: rule.notes
});

const getProviderForUser = async (userId: mongoose.Types.ObjectId) => {
  const provider = await InsuranceProvider.findOne({ userId });

  if (!provider) {
    throw new AppError("Create your insurance provider profile first", 400);
  }

  return provider;
};

insuranceRoutes.get("/plans", requireAuth, async (_req, res, next) => {
  try {
    const plans = await InsurancePlan.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      plans: plans.map(serializePlan)
    });
  } catch (error) {
    next(error);
  }
});

insuranceRoutes.get("/coverage/history", requireAuth, requireRole("patient"), async (req, res, next) => {
  try {
    const queries = await CoverageQuery.find({ patientUserId: req.user?._id })
      .populate("planId", "name planType")
      .sort({ createdAt: -1 })
      .limit(25);

    res.status(200).json({
      queries
    });
  } catch (error) {
    next(error);
  }
});

insuranceRoutes.post("/coverage/check", requireAuth, requireRole("patient"), async (req, res, next) => {
  try {
    const planId = String(req.body?.planId ?? "");

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      throw new AppError("Valid planId is required", 400);
    }

    const service = requireText(req.body?.service, "service").toLowerCase();
    let specialty = typeof req.body?.specialty === "string" ? req.body.specialty.trim() : "";
    const doctorId = typeof req.body?.doctorId === "string" ? req.body.doctorId : undefined;

    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new AppError("Valid doctorId is required", 400);
      }

      const doctor = await Doctor.findById(doctorId);
      specialty = specialty || doctor?.specialty || "";
    }

    if (!specialty) {
      throw new AppError("specialty is required", 400);
    }

    const plan = await InsurancePlan.findById(planId);

    if (!plan || !plan.isActive) {
      throw new AppError("Insurance plan not found", 404);
    }

    const normalizedSpecialty = specialty.toLowerCase();
    const exactRule = await CoverageRule.findOne({
      planId,
      specialty: normalizedSpecialty,
      service
    });
    const fallbackRule = exactRule
      ? null
      : await CoverageRule.findOne({
          planId,
          specialty: normalizedSpecialty,
          service: "general"
        });
    const rule = exactRule ?? fallbackRule;

    const resultStatus = rule?.coverageStatus ?? "unknown";
    const explanation = rule
      ? `${plan.name} marks ${service} for ${specialty} as ${rule.coverageStatus.replace("_", " ")}.${
          rule.copayAmount !== undefined ? ` Estimated copay is $${rule.copayAmount}.` : ""
        }${rule.coinsurancePercent !== undefined ? ` Coinsurance is ${rule.coinsurancePercent}%.` : ""}${
          rule.notes ? ` ${rule.notes}` : ""
        }`
      : `No matching coverage rule was found for ${service} under ${plan.name}. Contact the insurer to confirm benefits.`;

    const query = await CoverageQuery.create({
      patientUserId: req.user?._id,
      doctorId,
      planId,
      specialty,
      service,
      resultStatus,
      explanation
    });

    res.status(200).json({
      result: {
        id: query._id,
        status: resultStatus,
        explanation
      }
    });
  } catch (error) {
    next(error);
  }
});

insuranceRoutes.use(requireAuth, requireRole("insurance_provider"));

insuranceRoutes.get("/provider/me", async (req, res, next) => {
  try {
    const provider = await InsuranceProvider.findOne({ userId: req.user?._id });

    res.status(200).json({
      provider: serializeProvider(provider)
    });
  } catch (error) {
    next(error);
  }
});

insuranceRoutes.put("/provider/me", async (req, res, next) => {
  try {
    const provider = await InsuranceProvider.findOneAndUpdate(
      { userId: req.user?._id },
      {
        $set: {
          companyName: requireText(req.body?.companyName, "companyName"),
          payerId: typeof req.body?.payerId === "string" ? req.body.payerId.trim() : undefined,
          supportPhone: requireText(req.body?.supportPhone, "supportPhone"),
          supportEmail: requireText(req.body?.supportEmail, "supportEmail"),
          website: typeof req.body?.website === "string" ? req.body.website.trim() : undefined,
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
      provider: serializeProvider(provider)
    });
  } catch (error) {
    next(error);
  }
});

insuranceRoutes.get("/provider/plans", async (req, res, next) => {
  try {
    const provider = await getProviderForUser(req.user!._id);
    const plans = await InsurancePlan.find({ providerId: provider._id }).sort({ name: 1 });

    res.status(200).json({
      plans: plans.map(serializePlan)
    });
  } catch (error) {
    next(error);
  }
});

insuranceRoutes.post("/provider/plans", async (req, res, next) => {
  try {
    const provider = await getProviderForUser(req.user!._id);
    const plan = await InsurancePlan.create({
      providerId: provider._id,
      name: requireText(req.body?.name, "name"),
      planType: req.body?.planType ?? "other",
      memberServicesPhone:
        typeof req.body?.memberServicesPhone === "string"
          ? req.body.memberServicesPhone.trim()
          : undefined,
      isActive: true
    });

    res.status(201).json({
      plan: serializePlan(plan)
    });
  } catch (error) {
    next(error);
  }
});

insuranceRoutes.get("/provider/rules", async (req, res, next) => {
  try {
    const provider = await getProviderForUser(req.user!._id);
    const rules = await CoverageRule.find({ providerId: provider._id }).sort({
      specialty: 1,
      service: 1
    });

    res.status(200).json({
      rules: rules.map(serializeRule)
    });
  } catch (error) {
    next(error);
  }
});

insuranceRoutes.post("/provider/rules", async (req, res, next) => {
  try {
    const provider = await getProviderForUser(req.user!._id);
    const planId = String(req.body?.planId ?? "");

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      throw new AppError("Valid planId is required", 400);
    }

    const plan = await InsurancePlan.findOne({ _id: planId, providerId: provider._id });

    if (!plan) {
      throw new AppError("Plan not found for this provider", 404);
    }

    const rule = await CoverageRule.findOneAndUpdate(
      {
        providerId: provider._id,
        planId,
        specialty: requireText(req.body?.specialty, "specialty").toLowerCase(),
        service: requireText(req.body?.service, "service").toLowerCase()
      },
      {
        $set: {
          coverageStatus: req.body?.coverageStatus ?? "covered",
          copayAmount:
            req.body?.copayAmount === "" || req.body?.copayAmount === undefined
              ? undefined
              : Number(req.body.copayAmount),
          coinsurancePercent:
            req.body?.coinsurancePercent === "" || req.body?.coinsurancePercent === undefined
              ? undefined
              : Number(req.body.coinsurancePercent),
          notes: typeof req.body?.notes === "string" ? req.body.notes.trim() : undefined
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(201).json({
      rule: serializeRule(rule)
    });
  } catch (error) {
    next(error);
  }
});
