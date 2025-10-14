import { Router } from "express";
import { getDatabaseHealth } from "../config/database.js";
import { env } from "../config/env.js";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "curasure-backend",
    environment: env.nodeEnv,
    database: getDatabaseHealth(),
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});
