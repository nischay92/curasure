export type ConsultationMode = "in_person" | "telehealth";

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string;
  licenseNumber: string;
  npiNumber?: string;
  yearsExperience: number;
  clinicName: string;
  bio: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  languages: string[];
  acceptedInsurance: string[];
  consultationModes: ConsultationMode[];
  verificationStatus: "pending" | "verified" | "rejected";
  updatedAt: string;
}

export interface DoctorProfileInput {
  specialty: string;
  licenseNumber: string;
  npiNumber: string;
  yearsExperience: number;
  clinicName: string;
  bio: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  languages: string[];
  acceptedInsurance: string[];
  consultationModes: ConsultationMode[];
}
