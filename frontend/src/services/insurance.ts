import { api } from "./api";
import type {
  CoverageResult,
  CoverageRule,
  InsurancePlan,
  InsuranceProviderProfile
} from "../types/insurance";

export const fetchInsurancePlans = async () => {
  const response = await api.get("/insurance/plans");
  return response.data.plans as InsurancePlan[];
};

export const fetchProviderProfile = async () => {
  const response = await api.get("/insurance/provider/me");
  return response.data.provider as InsuranceProviderProfile | null;
};

export const saveProviderProfile = async (profile: Omit<InsuranceProviderProfile, "id" | "verificationStatus">) => {
  const response = await api.put("/insurance/provider/me", profile);
  return response.data.provider as InsuranceProviderProfile;
};

export const fetchProviderPlans = async () => {
  const response = await api.get("/insurance/provider/plans");
  return response.data.plans as InsurancePlan[];
};

export const createProviderPlan = async (plan: {
  name: string;
  planType: InsurancePlan["planType"];
  memberServicesPhone?: string;
}) => {
  const response = await api.post("/insurance/provider/plans", plan);
  return response.data.plan as InsurancePlan;
};

export const fetchCoverageRules = async () => {
  const response = await api.get("/insurance/provider/rules");
  return response.data.rules as CoverageRule[];
};

export const createCoverageRule = async (rule: {
  planId: string;
  specialty: string;
  service: string;
  coverageStatus: CoverageRule["coverageStatus"];
  copayAmount?: number;
  coinsurancePercent?: number;
  notes?: string;
}) => {
  const response = await api.post("/insurance/provider/rules", rule);
  return response.data.rule as CoverageRule;
};

export const checkCoverage = async (payload: {
  planId: string;
  doctorId?: string;
  specialty: string;
  service: string;
}) => {
  const response = await api.post("/insurance/coverage/check", payload);
  return response.data.result as CoverageResult;
};
