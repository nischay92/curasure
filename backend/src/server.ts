import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`CuraSure backend listening on port ${env.port}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`${signal} received. Shutting down CuraSure backend.`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

