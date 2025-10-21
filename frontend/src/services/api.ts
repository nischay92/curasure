import axios from "axios";
import { firebaseAuth } from "../config/firebase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"
});

api.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
