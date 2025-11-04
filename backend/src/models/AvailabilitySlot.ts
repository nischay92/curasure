import mongoose, { Schema, Types } from "mongoose";

export type AvailabilitySlotStatus = "open" | "booked" | "cancelled";

export interface AvailabilitySlotDocument {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  doctorUserId: Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  visitMode: "in_person" | "telehealth";
  status: AvailabilitySlotStatus;
  appointmentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySlotSchema = new Schema<AvailabilitySlotDocument>(
  {
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
    startsAt: {
      type: Date,
      required: true,
      index: true
    },
    endsAt: {
      type: Date,
      required: true
    },
    visitMode: {
      type: String,
      enum: ["in_person", "telehealth"],
      required: true
    },
    status: {
      type: String,
      enum: ["open", "booked", "cancelled"],
      default: "open",
      required: true
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment"
    }
  },
  {
    timestamps: true
  }
);

availabilitySlotSchema.index(
  { doctorId: 1, startsAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["open", "booked"] }
    }
  }
);

export const AvailabilitySlot =
  mongoose.models.AvailabilitySlot ||
  mongoose.model<AvailabilitySlotDocument>("AvailabilitySlot", availabilitySlotSchema);
