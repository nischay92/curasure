import { Router } from "express";
import { env } from "../config/env.js";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "curasure-backend",
    environment: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

