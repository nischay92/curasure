import mongoose, { Schema, Types } from "mongoose";

export interface InsurancePlanDocument {
  _id: Types.ObjectId;
  providerId: Types.ObjectId;
  name: string;
  planType: "hmo" | "ppo" | "epo" | "pos" | "other";
  memberServicesPhone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const insurancePlanSchema = new Schema<InsurancePlanDocument>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "InsuranceProvider",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    planType: {
      type: String,
      enum: ["hmo", "ppo", "epo", "pos", "other"],
      default: "other",
      required: true
    },
    memberServicesPhone: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

insurancePlanSchema.index({ providerId: 1, name: 1 }, { unique: true });

export const InsurancePlan =
  mongoose.models.InsurancePlan ||
  mongoose.model<InsurancePlanDocument>("InsurancePlan", insurancePlanSchema);
