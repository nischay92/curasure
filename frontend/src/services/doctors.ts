import { api } from "./api";
import type { DoctorProfile, DoctorProfileInput } from "../types/doctor";

export const fetchMyDoctorProfile = async () => {
  const response = await api.get("/doctors/me");
  return response.data.doctor as DoctorProfile | null;
};

export const saveMyDoctorProfile = async (profile: DoctorProfileInput) => {
  const response = await api.put("/doctors/me", profile);
  return response.data.doctor as DoctorProfile;
};
