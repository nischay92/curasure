import { api } from "./api";

export const fetchTelehealthLink = async (appointmentId: string) => {
  const response = await api.get(`/appointments/${appointmentId}/telehealth`);
  return response.data as { roomName: string; url: string };
};
