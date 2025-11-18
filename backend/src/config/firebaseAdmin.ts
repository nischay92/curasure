import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { env } from "./env.js";

const requireFirebaseEnv = () => {
  if (!env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
    throw new Error(
      "Firebase Admin credentials are required. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return {
    projectId: env.firebaseProjectId,
    clientEmail: env.firebaseClientEmail,
    privateKey: env.firebasePrivateKey
  };
};

export const initializeFirebaseAdmin = () => {
  if (getApps().length > 0) {
    return;
  }

  initializeApp({
    credential: cert(requireFirebaseEnv()),
    storageBucket: env.firebaseStorageBucket
  });
};

export const firebaseAuth = () => {
  initializeFirebaseAdmin();
  return getAuth();
};

export const firebaseStorageBucket = () => {
  initializeFirebaseAdmin();
  return getStorage().bucket();
};
