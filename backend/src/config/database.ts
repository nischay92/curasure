import mongoose from "mongoose";
import { env } from "./env.js";

const connectionStateByValue: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting"
};

export const connectDatabase = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required to connect to MongoDB");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongodbUri, {
    dbName: env.mongodbDbName,
    serverSelectionTimeoutMS: 10000
  });

  console.log("MongoDB connected");
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

export const getDatabaseHealth = () => {
  const state = mongoose.connection.readyState;

  return {
    status: state === 1 ? "ok" : "unavailable",
    state: connectionStateByValue[state] ?? "unknown",
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};
