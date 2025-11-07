import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { firebaseAuth } from "../config/firebaseAdmin.js";
import { User } from "../models/User.js";
import { createMessage, serializeMessage } from "../services/chatService.js";

let io: Server | null = null;

export const getSocketServer = () => io;

export const configureSocketServer = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.frontendOrigin,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (typeof token !== "string") {
        next(new Error("Authentication token is required"));
        return;
      }

      const decodedToken = await firebaseAuth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (!user || !user.isActive) {
        next(new Error("User profile not found or inactive"));
        return;
      }

      socket.data.user = user;
      next();
    } catch {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.user._id}`);

    socket.on("conversation:join", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId: socket.data.user._id
      });
    });

    socket.on(
      "message:send",
      async (
        payload: { conversationId?: string; body?: string },
        acknowledge?: (response: { ok: boolean; error?: string }) => void
      ) => {
        try {
          if (!payload.conversationId || !payload.body) {
            acknowledge?.({ ok: false, error: "conversationId and body are required" });
            return;
          }

          const message = await createMessage(
            payload.conversationId,
            socket.data.user._id,
            payload.body
          );
          const serialized = serializeMessage(message);
          io?.to(`conversation:${payload.conversationId}`).emit("message:new", serialized);
          acknowledge?.({ ok: true });
        } catch (error) {
          acknowledge?.({
            ok: false,
            error: error instanceof Error ? error.message : "Unable to send message"
          });
        }
      }
    );
  });

  return io;
};
