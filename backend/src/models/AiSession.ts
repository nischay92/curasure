import mongoose, { Schema, Types } from "mongoose";

export interface AiSessionDocument {
  _id: Types.ObjectId;
  patientUserId: Types.ObjectId;
  symptoms: string;
  recommendedSpecialty: string;
  urgency: "routine" | "soon" | "urgent";
  source: "gemini" | "rules";
  guidance: string;
  disclaimer: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiSessionSchema = new Schema<AiSessionDocument>(
  {
    patientUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    recommendedSpecialty: {
      type: String,
      required: true,
      trim: true
    },
    urgency: {
      type: String,
      enum: ["routine", "soon", "urgent"],
      required: true
    },
    source: {
      type: String,
      enum: ["gemini", "rules"],
      required: true
    },
    guidance: {
      type: String,
      required: true,
      trim: true
    },
    disclaimer: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const AiSession =
  mongoose.models.AiSession || mongoose.model<AiSessionDocument>("AiSession", aiSessionSchema);
