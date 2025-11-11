export interface InsuranceProviderProfile {
  id: string;
  companyName: string;
  payerId?: string;
  supportPhone: string;
  supportEmail: string;
  website?: string;
  verificationStatus: "pending" | "verified" | "rejected";
}

export interface InsurancePlan {
  id: string;
  providerId: string;
  name: string;
  planType: "hmo" | "ppo" | "epo" | "pos" | "other";
  memberServicesPhone?: string;
  isActive: boolean;
}

export interface CoverageRule {
  id: string;
  providerId: string;
  planId: string;
  specialty: string;
  service: string;
  coverageStatus: "covered" | "not_covered" | "prior_authorization";
  copayAmount?: number;
  coinsurancePercent?: number;
  notes?: string;
}

export interface CoverageResult {
  id: string;
  status: "covered" | "not_covered" | "prior_authorization" | "unknown";
  explanation: string;
}
