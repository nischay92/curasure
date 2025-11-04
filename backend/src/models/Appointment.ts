import mongoose, { Schema, Types } from "mongoose";

export const appointmentStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export interface AppointmentDocument {
  _id: Types.ObjectId;
  patientUserId: Types.ObjectId;
  doctorId: Types.ObjectId;
  doctorUserId: Types.ObjectId;
  availabilitySlotId: Types.ObjectId;
  scheduledAt: Date;
  durationMinutes: number;
  reason: string;
  visitMode: "in_person" | "telehealth";
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    patientUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true
    },
    doctorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    availabilitySlotId: {
      type: Schema.Types.ObjectId,
      ref: "AvailabilitySlot",
      required: true,
      index: true,
      unique: true
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 15,
      max: 180
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 800
    },
    visitMode: {
      type: String,
      enum: ["in_person", "telehealth"],
      required: true
    },
    status: {
      type: String,
      enum: appointmentStatuses,
      default: "pending",
      required: true
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index(
  { doctorId: 1, scheduledAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed"] }
    }
  }
);

export const Appointment =
  mongoose.models.Appointment ||
  mongoose.model<AppointmentDocument>("Appointment", appointmentSchema);
