import type { Types } from "mongoose";
import { AuditLog } from "../models/AuditLog.js";

export const writeAuditLog = async (payload: {
  actorUserId?: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
}) => {
  await AuditLog.create(payload);
};
