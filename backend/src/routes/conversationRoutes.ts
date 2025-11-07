import { Router } from "express";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { requireAuth } from "../middleware/auth.js";
import { getSocketServer } from "../realtime/socket.js";
import {
  assertConversationParticipant,
  createConversationForDoctor,
  createConversationForUser,
  createMessage,
  serializeConversation,
  serializeMessage
} from "../services/chatService.js";

export const conversationRoutes = Router();

conversationRoutes.use(requireAuth);

conversationRoutes.get("/", async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participantUserIds: req.user?._id
    })
      .populate("participantUserIds", "email displayName role")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    res.status(200).json({
      conversations: conversations.map((conversation) =>
        serializeConversation(conversation, req.user?._id)
      )
    });
  } catch (error) {
    next(error);
  }
});

conversationRoutes.post("/", async (req, res, next) => {
  try {
    if (!req.body?.doctorId && !req.body?.recipientUserId) {
      res.status(400).json({
        error: {
          message: "doctorId or recipientUserId is required",
          statusCode: 400
        }
      });
      return;
    }

    const conversation = req.body?.doctorId
      ? await createConversationForDoctor(req.user!._id, String(req.body.doctorId))
      : await createConversationForUser(req.user!._id, String(req.body.recipientUserId));

    res.status(200).json({
      conversation: serializeConversation(conversation, req.user?._id)
    });
  } catch (error) {
    next(error);
  }
});

conversationRoutes.get("/:conversationId/messages", async (req, res, next) => {
  try {
    await assertConversationParticipant(req.params.conversationId, req.user!._id);

    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });

    res.status(200).json({
      messages: messages.map(serializeMessage)
    });
  } catch (error) {
    next(error);
  }
});

conversationRoutes.post("/:conversationId/messages", async (req, res, next) => {
  try {
    const message = await createMessage(
      req.params.conversationId,
      req.user!._id,
      String(req.body?.body ?? "")
    );
    const serialized = serializeMessage(message);

    getSocketServer()?.to(`conversation:${req.params.conversationId}`).emit("message:new", serialized);

    res.status(201).json({
      message: serialized
    });
  } catch (error) {
    next(error);
  }
});
