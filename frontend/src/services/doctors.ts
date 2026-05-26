import { api } from "./api";
import type { DoctorProfile, DoctorProfileInput } from "../types/doctor";

export interface DoctorSearchFilters {
  specialty?: string;
  city?: string;
  state?: string;
  insurance?: string;
  consultationMode?: string;
}

export const searchDoctors = async (filters: DoctorSearchFilters) => {
  const response = await api.get("/doctors", {
    params: filters
  });
  return response.data.doctors as DoctorProfile[];
};

export const fetchMyDoctorProfile = async () => {
  const response = await api.get("/doctors/me");
  return response.data.doctor as DoctorProfile | null;
};

export const saveMyDoctorProfile = async (profile: DoctorProfileInput) => {
  const response = await api.put("/doctors/me", profile);
  return response.data.doctor as DoctorProfile;
};
