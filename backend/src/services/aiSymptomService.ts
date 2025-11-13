import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

export interface SymptomGuidance {
  recommendedSpecialty: string;
  urgency: "routine" | "soon" | "urgent";
  guidance: string;
  source: "gemini" | "rules";
}

const disclaimer =
  "This is not a medical diagnosis. If symptoms are severe, worsening, or life-threatening, seek emergency care immediately.";

const specialtyRules = [
  {
    specialty: "Emergency medicine",
    urgency: "urgent" as const,
    keywords: ["chest pain", "stroke", "severe bleeding", "fainting", "trouble breathing", "suicidal"]
  },
  {
    specialty: "Cardiology",
    urgency: "soon" as const,
    keywords: ["heart", "palpitations", "blood pressure", "chest tightness"]
  },
  {
    specialty: "Neurology",
    urgency: "soon" as const,
    keywords: ["migraine", "headache", "seizure", "numbness", "dizziness", "weakness"]
  },
  {
    specialty: "Dermatology",
    urgency: "routine" as const,
    keywords: ["rash", "skin", "acne", "mole", "itching"]
  },
  {
    specialty: "Orthopedics",
    urgency: "routine" as const,
    keywords: ["knee", "back pain", "joint", "fracture", "sprain", "shoulder"]
  },
  {
    specialty: "Gastroenterology",
    urgency: "routine" as const,
    keywords: ["stomach", "abdominal", "nausea", "diarrhea", "constipation", "acid reflux"]
  },
  {
    specialty: "Primary care",
    urgency: "routine" as const,
    keywords: ["fever", "cough", "cold", "fatigue", "checkup", "general"]
  }
];

export const ruleBasedGuidance = (symptoms: string): SymptomGuidance => {
  const normalized = symptoms.toLowerCase();
  const match =
    specialtyRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword))) ??
    specialtyRules[specialtyRules.length - 1];

  return {
    recommendedSpecialty: match.specialty,
    urgency: match.urgency,
    source: "rules",
    guidance: `Based on the symptoms shared, ${match.specialty} is a reasonable starting point. Track when symptoms started, severity, medications, and any triggers before the visit. ${disclaimer}`
  };
};

const parseGeminiJson = (text: string): Omit<SymptomGuidance, "source"> | null => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (
      typeof parsed.recommendedSpecialty === "string" &&
      ["routine", "soon", "urgent"].includes(parsed.urgency) &&
      typeof parsed.guidance === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

export const generateSymptomGuidance = async (symptoms: string): Promise<SymptomGuidance> => {
  const fallback = ruleBasedGuidance(symptoms);

  if (!env.geminiApiKey) {
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are helping route a patient to the right doctor specialty. Do not diagnose. Return only JSON with recommendedSpecialty, urgency as routine|soon|urgent, and guidance. Symptoms: ${symptoms}`
    });
    const parsed = parseGeminiJson(response.text ?? "");

    if (!parsed) {
      return fallback;
    }

    return {
      ...parsed,
      source: "gemini",
      guidance: `${parsed.guidance} ${disclaimer}`
    };
  } catch {
    return fallback;
  }
};

export const symptomDisclaimer = disclaimer;
