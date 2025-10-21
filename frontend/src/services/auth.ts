import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import { firebaseAuth } from "../config/firebase";
import { api } from "./api";

export type AppRole = "patient" | "doctor" | "insurance_provider" | "admin";

export const registerWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(firebaseAuth, email, password);
};

export const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
};

export const logout = () => {
  return signOut(firebaseAuth);
};

export const listenToAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(firebaseAuth, callback);
};

export const fetchCurrentProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data.user;
};

export const syncCurrentProfile = async (role: AppRole) => {
  const response = await api.post("/auth/profile", { role });
  return response.data.user;
};
