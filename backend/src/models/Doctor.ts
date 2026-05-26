import mongoose, { Schema, Types } from "mongoose";

export const doctorVerificationStatuses = ["pending", "verified", "rejected"] as const;

export type DoctorVerificationStatus = (typeof doctorVerificationStatuses)[number];

export interface DoctorDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
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
  latitude?: number;
  longitude?: number;
  languages: string[];
  acceptedInsurance: string[];
  consultationModes: Array<"in_person" | "telehealth">;
  verificationStatus: DoctorVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<DoctorDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    specialty: {
      type: String,
      required: true,
      trim: true
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true
    },
    npiNumber: {
      type: String,
      trim: true
    },
    yearsExperience: {
      type: Number,
      min: 0,
      max: 80,
      required: true
    },
    clinicName: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    languages: {
      type: [String],
      default: []
    },
    acceptedInsurance: {
      type: [String],
      default: []
    },
    consultationModes: {
      type: [String],
      enum: ["in_person", "telehealth"],
      default: ["in_person"]
    },
    verificationStatus: {
      type: String,
      enum: doctorVerificationStatuses,
      default: "pending",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Doctor =
  mongoose.models.Doctor || mongoose.model<DoctorDocument>("Doctor", doctorSchema);
