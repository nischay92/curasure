import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();

await connectDatabase();

const server = app.listen(env.port, () => {
  console.log(`CuraSure backend listening on port ${env.port}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`${signal} received. Shutting down CuraSure backend.`);
  server.close(() => {
    disconnectDatabase()
      .catch((error: unknown) => {
        console.error("MongoDB disconnect failed", error);
      })
      .finally(() => {
        process.exit(0);
      });
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
