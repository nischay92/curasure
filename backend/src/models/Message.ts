import mongoose, { Schema, Types } from "mongoose";

export interface MessageDocument {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderUserId: Types.ObjectId;
  body: string;
  deliveredToUserIds: Types.ObjectId[];
  readByUserIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    deliveredToUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    readByUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message =
  mongoose.models.Message || mongoose.model<MessageDocument>("Message", messageSchema);
