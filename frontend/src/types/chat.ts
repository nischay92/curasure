export interface Conversation {
  id: string;
  participantUserIds: string[];
  otherParticipant?: {
    id: string;
    email: string;
    displayName?: string;
    role: string;
  };
  lastMessageAt?: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  deliveredToUserIds: string[];
  readByUserIds: string[];
  createdAt: string;
}
