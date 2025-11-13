import { api } from "./api";
import type { AiSymptomResponse } from "../types/ai";

export const requestSymptomGuidance = async (payload: {
  symptoms: string;
  city?: string;
  state?: string;
  insurance?: string;
}) => {
  const response = await api.post("/ai/symptoms", payload);
  return response.data as AiSymptomResponse;
};
