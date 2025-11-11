import mongoose, { Schema, Types } from "mongoose";

export interface CoverageRuleDocument {
  _id: Types.ObjectId;
  providerId: Types.ObjectId;
  planId: Types.ObjectId;
  specialty: string;
  service: string;
  coverageStatus: "covered" | "not_covered" | "prior_authorization";
  copayAmount?: number;
  coinsurancePercent?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const coverageRuleSchema = new Schema<CoverageRuleDocument>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "InsuranceProvider",
      required: true,
      index: true
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "InsurancePlan",
      required: true,
      index: true
    },
    specialty: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    service: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    coverageStatus: {
      type: String,
      enum: ["covered", "not_covered", "prior_authorization"],
      required: true
    },
    copayAmount: {
      type: Number,
      min: 0
    },
    coinsurancePercent: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

coverageRuleSchema.index({ planId: 1, specialty: 1, service: 1 }, { unique: true });

export const CoverageRule =
  mongoose.models.CoverageRule ||
  mongoose.model<CoverageRuleDocument>("CoverageRule", coverageRuleSchema);
