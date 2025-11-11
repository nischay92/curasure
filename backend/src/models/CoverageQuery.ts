import mongoose, { Schema, Types } from "mongoose";

export interface CoverageQueryDocument {
  _id: Types.ObjectId;
  patientUserId: Types.ObjectId;
  doctorId?: Types.ObjectId;
  planId: Types.ObjectId;
  specialty: string;
  service: string;
  resultStatus: "covered" | "not_covered" | "prior_authorization" | "unknown";
  explanation: string;
  createdAt: Date;
  updatedAt: Date;
}

const coverageQuerySchema = new Schema<CoverageQueryDocument>(
  {
    patientUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor"
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "InsurancePlan",
      required: true
    },
    specialty: {
      type: String,
      required: true,
      trim: true
    },
    service: {
      type: String,
      required: true,
      trim: true
    },
    resultStatus: {
      type: String,
      enum: ["covered", "not_covered", "prior_authorization", "unknown"],
      required: true
    },
    explanation: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const CoverageQuery =
  mongoose.models.CoverageQuery ||
  mongoose.model<CoverageQueryDocument>("CoverageQuery", coverageQuerySchema);
