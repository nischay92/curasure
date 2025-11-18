import mongoose, { Schema, Types } from "mongoose";

export interface DocumentDocument {
  _id: Types.ObjectId;
  ownerUserId: Types.ObjectId;
  type: "medical_document" | "insurance_card";
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<DocumentDocument>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["medical_document", "insurance_card"],
      required: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 1
    },
    storagePath: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export const Document =
  mongoose.models.Document || mongoose.model<DocumentDocument>("Document", documentSchema);
