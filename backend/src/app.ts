import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { healthRoutes } from "./routes/healthRoutes.js";

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

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

