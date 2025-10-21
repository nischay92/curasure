import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI,
  mongodbDbName: process.env.MONGODB_DB_NAME ?? "curasure",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET
};
