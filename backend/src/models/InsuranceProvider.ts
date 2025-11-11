import mongoose, { Schema, Types } from "mongoose";

export interface InsuranceProviderDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  companyName: string;
  payerId?: string;
  supportPhone: string;
  supportEmail: string;
  website?: string;
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const insuranceProviderSchema = new Schema<InsuranceProviderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    payerId: {
      type: String,
      trim: true
    },
    supportPhone: {
      type: String,
      required: true,
      trim: true
    },
    supportEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const InsuranceProvider =
  mongoose.models.InsuranceProvider ||
  mongoose.model<InsuranceProviderDocument>("InsuranceProvider", insuranceProviderSchema);
