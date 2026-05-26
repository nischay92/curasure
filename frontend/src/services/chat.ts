import { io, type Socket } from "socket.io-client";
import { firebaseAuth } from "../config/firebase";
import { api } from "./api";
import type { ChatMessage, Conversation } from "../types/chat";

let socket: Socket | null = null;

export const fetchConversations = async () => {
  const response = await api.get("/conversations");
  return response.data.conversations as Conversation[];
};

export const createConversation = async (payload: { doctorId?: string; recipientUserId?: string }) => {
  const response = await api.post("/conversations", payload);
  return response.data.conversation as Conversation;
};

export const fetchMessages = async (conversationId: string) => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data.messages as ChatMessage[];
};

export const sendMessage = async (conversationId: string, body: string) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, { body });
  return response.data.message as ChatMessage;
};

export const getChatSocket = async () => {
  const token = await firebaseAuth.currentUser?.getIdToken();

  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000", {
    auth: {
      token
    }
  });

  return socket;
};

export const disconnectChatSocket = () => {
  socket?.disconnect();
  socket = null;
};
