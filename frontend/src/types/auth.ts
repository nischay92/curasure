export type AppRole = "patient" | "doctor" | "insurance_provider" | "admin";

export interface AppProfile {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  role: AppRole;
  isActive: boolean;
}
