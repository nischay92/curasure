import mongoose, { Schema, Types } from "mongoose";

export const userRoles = ["patient", "doctor", "insurance_provider", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export interface UserDocument {
  _id: Types.ObjectId;
  firebaseUid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    displayName: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: userRoles,
      default: "patient",
      required: true
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

export const User = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
