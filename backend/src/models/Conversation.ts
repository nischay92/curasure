import mongoose, { Schema, Types } from "mongoose";

export interface ConversationDocument {
  _id: Types.ObjectId;
  participantUserIds: Types.ObjectId[];
  participantKey: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    participantUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      }
    ],
    participantKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lastMessageAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ participantUserIds: 1, updatedAt: -1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationDocument>("Conversation", conversationSchema);
