import mongoose, { Types } from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { Doctor } from "../models/Doctor.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

export const serializeConversation = (conversation: any, currentUserId?: Types.ObjectId) => {
  const participants = Array.isArray(conversation.participantUserIds)
    ? conversation.participantUserIds
    : [];
  const otherParticipant = participants.find((participant: any) => {
    const participantId = participant?._id ?? participant;
    return currentUserId ? String(participantId) !== String(currentUserId) : true;
  });

  return {
    id: conversation._id,
    participantUserIds: participants.map((participant: any) => participant?._id ?? participant),
    otherParticipant:
      otherParticipant && typeof otherParticipant === "object"
        ? {
            id: otherParticipant._id,
            email: otherParticipant.email,
            displayName: otherParticipant.displayName,
            role: otherParticipant.role
          }
        : undefined,
    lastMessageAt: conversation.lastMessageAt,
    updatedAt: conversation.updatedAt
  };
};

const toParticipantKey = (participantUserIds: Types.ObjectId[]) => {
  return participantUserIds.map(String).sort().join(":");
};

export const serializeMessage = (message: any) => ({
  id: message._id,
  conversationId: message.conversationId,
  senderUserId: message.senderUserId,
  body: message.body,
  deliveredToUserIds: message.deliveredToUserIds,
  readByUserIds: message.readByUserIds,
  createdAt: message.createdAt
});

export const assertConversationParticipant = async (
  conversationId: string,
  userId: Types.ObjectId
) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new AppError("Valid conversationId is required", 400);
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participantUserIds: userId
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  return conversation;
};

export const createConversationForDoctor = async (
  currentUserId: Types.ObjectId,
  doctorId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new AppError("Valid doctorId is required", 400);
  }

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  if (String(doctor.userId) === String(currentUserId)) {
    throw new AppError("You cannot start a conversation with yourself", 400);
  }

  const participantUserIds = [currentUserId, doctor.userId].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
  const participantKey = toParticipantKey(participantUserIds);

  const existingConversation = await Conversation.findOne({ participantKey }).populate(
    "participantUserIds",
    "email displayName role"
  );

  if (existingConversation) {
    return existingConversation;
  }

  const conversation = await Conversation.create({
    participantUserIds,
    participantKey
  });

  await conversation.populate("participantUserIds", "email displayName role");

  return conversation;
};

export const createConversationForUser = async (
  currentUserId: Types.ObjectId,
  recipientUserId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(recipientUserId)) {
    throw new AppError("Valid recipientUserId is required", 400);
  }

  if (String(currentUserId) === recipientUserId) {
    throw new AppError("You cannot start a conversation with yourself", 400);
  }

  const recipient = await User.findById(recipientUserId);

  if (!recipient || !recipient.isActive) {
    throw new AppError("Recipient not found", 404);
  }

  const participantUserIds = [currentUserId, recipient._id].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
  const participantKey = toParticipantKey(participantUserIds);

  const existingConversation = await Conversation.findOne({ participantKey }).populate(
    "participantUserIds",
    "email displayName role"
  );

  if (existingConversation) {
    return existingConversation;
  }

  const conversation = await Conversation.create({
    participantUserIds,
    participantKey
  });

  await conversation.populate("participantUserIds", "email displayName role");

  return conversation;
};

export const createMessage = async (
  conversationId: string,
  senderUserId: Types.ObjectId,
  body: string
) => {
  const conversation = await assertConversationParticipant(conversationId, senderUserId);
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new AppError("Message body is required", 400);
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderUserId,
    body: trimmedBody,
    deliveredToUserIds: [senderUserId],
    readByUserIds: [senderUserId]
  });

  await Conversation.findByIdAndUpdate(conversation._id, {
    $set: {
      lastMessageAt: message.createdAt
    }
  });

  return message;
};
