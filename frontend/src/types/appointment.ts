export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type VisitMode = "in_person" | "telehealth";

export interface Appointment {
  id: string;
  patientUserId: string;
  patientEmail?: string;
  doctorId: string;
  doctorName?: string;
  specialty?: string;
  availabilitySlotId: string;
  scheduledAt: string;
  durationMinutes: number;
  reason: string;
  visitMode: VisitMode;
  status: AppointmentStatus;
}

export interface AppointmentInput {
  availabilitySlotId: string;
  reason: string;
}

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  visitMode: VisitMode;
  status: "open" | "booked" | "cancelled";
  appointmentId?: string;
}

export interface AvailabilitySlotInput {
  startsAt: string;
  visitMode: VisitMode;
}
