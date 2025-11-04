import { api } from "./api";
import type {
  Appointment,
  AppointmentInput,
  AvailabilitySlot,
  AvailabilitySlotInput
} from "../types/appointment";

export const fetchAppointments = async () => {
  const response = await api.get("/appointments");
  return response.data.appointments as Appointment[];
};

export const fetchDoctorSlots = async (doctorId: string) => {
  const response = await api.get("/appointments/slots", {
    params: {
      doctorId
    }
  });
  return response.data.slots as AvailabilitySlot[];
};

export const createAvailabilitySlot = async (slot: AvailabilitySlotInput) => {
  const response = await api.post("/appointments/slots", slot);
  return response.data.slot as AvailabilitySlot;
};

export const bookAppointment = async (appointment: AppointmentInput) => {
  const response = await api.post("/appointments", appointment);
  return response.data.appointment as Appointment;
};
