import mongoose, { Schema, Types } from "mongoose";

export interface AuditLogDocument {
  _id: Types.ObjectId;
  actorUserId?: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    targetType: {
      type: String,
      required: true,
      trim: true
    },
    targetId: {
      type: Schema.Types.ObjectId
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema);
