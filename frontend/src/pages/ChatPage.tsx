import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  fetchConversations,
  fetchMessages,
  getChatSocket,
  sendMessage
} from "../services/chat";
import { useAuth } from "../context/AuthContext";
import type { ChatMessage, Conversation } from "../types/chat";

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));

export const ChatPage = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [activeConversationId, conversations]
  );

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const results = await fetchConversations();
        setConversations(results);
        setActiveConversationId(results[0]?.id ?? "");
      } catch {
        setError("Unable to load conversations.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadConversations();
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const results = await fetchMessages(activeConversationId);
        setMessages(results);
      } catch {
        setError("Unable to load messages.");
      }
    };

    void loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    let cleanup = () => {};

    const connect = async () => {
      const socket = await getChatSocket();

      if (!socket) {
        return;
      }

      if (activeConversationId) {
        socket.emit("conversation:join", activeConversationId);
      }

      const handleNewMessage = (message: ChatMessage) => {
        if (message.conversationId === activeConversationId) {
          setMessages((current) =>
            current.some((item) => item.id === message.id) ? current : [...current, message]
          );
        }
      };

      const handleTyping = (payload: { conversationId: string; userId: string }) => {
        if (payload.conversationId === activeConversationId && payload.userId !== profile?.id) {
          setIsTyping(true);
          window.setTimeout(() => setIsTyping(false), 1400);
        }
      };

      socket.on("message:new", handleNewMessage);
      socket.on("typing", handleTyping);

      cleanup = () => {
        socket.off("message:new", handleNewMessage);
        socket.off("typing", handleTyping);
      };
    };

    void connect();

    return () => cleanup();
  }, [activeConversationId, profile?.id]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeConversationId || !draft.trim()) {
      return;
    }

    const body = draft;
    setDraft("");

    try {
      const message = await sendMessage(activeConversationId, body);
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message]
      );
    } catch {
      setError("Unable to send message.");
      setDraft(body);
    }
  };

  const emitTyping = async () => {
    setDraft((current) => current);
    const socket = await getChatSocket();
    socket?.emit("typing", activeConversationId);
  };

  return (
    <>
      <h1>Secure chat</h1>
      <p>Message doctors or patients who share an active conversation with you.</p>
      {error && <div className="alert">{error}</div>}
      <section className="chat-layout">
        <aside className="conversation-list" aria-label="Conversations">
          {isLoading && <div className="notice">Loading conversations...</div>}
          {!isLoading && conversations.length === 0 && (
            <div className="notice">No conversations yet. Start one from doctor search.</div>
          )}
          {conversations.map((conversation) => (
            <button
              className={conversation.id === activeConversationId ? "conversation active" : "conversation"}
              key={conversation.id}
              type="button"
              onClick={() => setActiveConversationId(conversation.id)}
            >
              <strong>
                {conversation.otherParticipant?.displayName ||
                  conversation.otherParticipant?.email ||
                  "Conversation"}
              </strong>
              <span>{conversation.otherParticipant?.role}</span>
            </button>
          ))}
        </aside>
        <div className="chat-window">
          <div className="chat-header">
            <h2>
              {activeConversation?.otherParticipant?.displayName ||
                activeConversation?.otherParticipant?.email ||
                "Select a conversation"}
            </h2>
            {isTyping && <span>Typing...</span>}
          </div>
          <div className="message-list" aria-live="polite">
            {messages.map((message) => {
              const mine = message.senderUserId === profile?.id;
              return (
                <article className={mine ? "message mine" : "message"} key={message.id}>
                  <p>{message.body}</p>
                  <span>
                    {formatTime(message.createdAt)} · {mine ? "sent" : "delivered"}
                  </span>
                </article>
              );
            })}
          </div>
          <form className="message-form" onSubmit={handleSend}>
            <input
              disabled={!activeConversationId}
              placeholder="Type a secure message"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                void emitTyping();
              }}
            />
            <button className="primary-button" disabled={!activeConversationId || !draft.trim()} type="submit">
              Send
            </button>
          </form>
        </div>
      </section>
    </>
  );
};
