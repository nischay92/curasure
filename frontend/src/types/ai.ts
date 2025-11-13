import type { DoctorProfile } from "./doctor";

export interface AiSymptomSession {
  id: string;
  symptoms: string;
  recommendedSpecialty: string;
  urgency: "routine" | "soon" | "urgent";
  source: "gemini" | "rules";
  guidance: string;
  disclaimer: string;
}

export interface AiSymptomResponse {
  session: AiSymptomSession;
  doctors: Array<
    Pick<
      DoctorProfile,
      | "id"
      | "clinicName"
      | "specialty"
      | "city"
      | "state"
      | "acceptedInsurance"
      | "consultationModes"
      | "verificationStatus"
    >
  >;
}
