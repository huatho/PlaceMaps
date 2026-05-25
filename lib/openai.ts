import { GoogleGenAI } from "@google/genai";
import type { AiSuggestions, Review } from "@/types/review";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY?.trim()
});

function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function buildPrompt(review: Review) {
  return [
    "Generate three reply suggestions for this Google review.",
    "",
    `Reviewer: ${review.authorName}`,
    `Rating: ${review.rating}/5`,
    `Review date: ${review.reviewDate}`,
    `Review text: ${review.content}`,
    "",
    "Write as the business owner or hospitality team.",
    "Reply in the same language as the review.",
    "Keep each reply professional, specific to the review, and ready to send.",
    "Keep each reply concise and long enough to be useful, but not overly long.",
    "Do not mention that AI wrote the reply.",
    "",
    "Return only valid JSON in this exact shape:",
    '{"standard":"...","friendly":"...","recovery":"..."}'
  ].join("\n");
}

function isAiSuggestions(value: unknown): value is AiSuggestions {
  if (!value || typeof value !== "object") {
    return false;
  }

  const suggestions = value as Partial<Record<keyof AiSuggestions, unknown>>;

  return (
    typeof suggestions.standard === "string" &&
    typeof suggestions.friendly === "string" &&
    typeof suggestions.recovery === "string"
  );
}

function parseJsonResponse(text: string) {
  const trimmedText = text.trim();
  const jsonText = trimmedText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(jsonText) as unknown;
}

export async function generateAiReplySuggestions(review: Review): Promise<AiSuggestions> {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  const response = await ai.models.generateContent({
    model: getGeminiModel(),
    contents: buildPrompt(review),
    config: {
      responseMimeType: "application/json"
    }
  });

  const suggestions = parseJsonResponse(response.text ?? "");

  if (!isAiSuggestions(suggestions)) {
    throw new Error("Gemini returned an unexpected reply format.");
  }

  return suggestions;
}
