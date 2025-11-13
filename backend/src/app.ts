import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authRoutes } from "./routes/authRoutes.js";
import { appointmentRoutes } from "./routes/appointmentRoutes.js";
import { aiRoutes } from "./routes/aiRoutes.js";
import { conversationRoutes } from "./routes/conversationRoutes.js";
import { doctorRoutes } from "./routes/doctorRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { insuranceRoutes } from "./routes/insuranceRoutes.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.get("/", (_req, res) => {
    res.status(200).json({
      service: "curasure-backend",
      status: "running"
    });
  });

  app.use("/health", healthRoutes);
  app.use("/auth", authRoutes);
  app.use("/doctors", doctorRoutes);
  app.use("/appointments", appointmentRoutes);
  app.use("/conversations", conversationRoutes);
  app.use("/insurance", insuranceRoutes);
  app.use("/ai", aiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
